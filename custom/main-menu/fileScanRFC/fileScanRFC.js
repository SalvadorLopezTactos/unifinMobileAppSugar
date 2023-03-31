import customization from 'APP/js/core/customization';
import NomadView from 'VIEWS/nomad-view';
import device from 'APP/js/core/device';
import dialog from 'APP/js/core/dialog';

customization.registerMainMenuItem({
    label: 'Crear Cuenta desde QR',
    iconKey: 'actions.barcode',
    rank: 0,
    route:'image_qr_rfc',
    isVisible() {
        //return app.isNative;
        return true;
    },
});

customization.registerRecordAction({
    name: 'scan_qr_main',
    modules: ['Accounts'],
    types: ['right-menu-detail'],
    label: 'Actualizar Cuenta desde QR',
    iconKey: 'actions.barcode',
    rank: 1,

    handler(view, model) {
        //Mandar mensaje de cuenta no contactable y evitar cualquier acción
        if(model.get('tct_no_contactar_chk_c')){
            app.alert.show("cuentas_no_contactar", {
                level: "error",
                messages: "Cuenta No Contactable\nCualquier duda o aclaraci\u00F3n, favor de contactar al \u00E1rea de Administraci\u00F3n de cartera",
                autoClose: false
            });

        }else{
            app.controller.loadScreen({
                view: ScanQRView,
                data:{
                    from:'detalle',
                    idCuenta:model.get('id')
                }
            });
        }
    },
});

customization.registerRoutes([{
    name: 'scanQR',      // Uniquely identifies the route
    steps: 'image_qr_rfc',     // Route hash fragment: '#hello'

    handler(options) {
        app.controller.loadScreen({
            isDynamic: true,
            view: ScanQRView,
            data:{
                from:'creacion',
                idCuenta:''
            }
        });
    }   
}]);

//Definición de nueva vista para edición de Ubicaciones
class ScanQRView extends NomadView{
    // Se especifica el nombre de la vista hbs
    template = 'fileScanRFC';

    // Configure the header
    headerConfig = {
        title: 'Escaneo de RFC',
        buttons: {
            mainMenu: true
        },
    };

    events() {
        return {
            'click #send_request': 'sendRequestRFC',
            //'click #boton': 'openDialogFile',
            'click #boton': 'abrirDialogoSeleccion',
            'change #file_rfc':'setImagePreview'

        }
    }

    flagGaleria = null;

    
    initialize(options) {
        this.desdeCualVista=options.data;
        self = this;
        super.initialize(options);
    }
    

    
    onAfterRender(){
        this.abrirDialogoSeleccion();
        //$('#boton').trigger('click');
    }
    

    sendRequestRFC(event){
        //Obtener extensión del archivo elegido solo aceptar (jpg,jpeg y png);
        $('#boton').addClass('disabled');
        $('#boton').css('pointer-events','none');

        app.alert.show('getInfoRFC', {
            level: 'load',
            closeable: false,
            messages: app.lang.get('LBL_LOADING'),
        });

        $('#send_request').addClass('disabled');
        $('#send_request').css('pointer-events','none');

        var imagen=document.getElementById('imageRFC_QR');
        var imagenBase64='';
        if(self.flagGaleria==1){
            imagenBase64=imagen.src;
        }else{
            imagenBase64=self.getBase64Image(imagen);
        } 
        var body={
            "file":imagenBase64
            }

        app.api.call('create', app.api.buildURL("GetInfoRFCbyQR"), body, {
            success: _.bind(function (data) {
                app.alert.dismiss('getInfoRFC');
                if(data !=null){
                    if (data[0]['Mensaje de error']!=undefined) {

                        app.alert.show('error_rfc', {
                            level: 'error',
                            messages: data[0]['Mensaje de error'],
                            autoClose: true
                        });

                        //Habilitando botón para seleccionar qr
                        $('#boton').removeClass('disabled');
                        $('#boton').css('pointer-events','auto');

                        //Habilitando nuevamente el botón de enviar
                        $('#send_request').removeClass('disabled');
                        $('#send_request').css('pointer-events','auto');
                    }else{

                        var contextoQR=self;
                        //Comprobar que el RFC no existe para poder crear o actualizar el registro
                        app.alert.show('validando_duplicados', {
                            level: 'load',
                            messages: 'Cargando...'
                        });

                        contextoQR.data=data;

                        var urlCuentas= app.api.buildURL("Accounts/", null, null, {
                            fields: "rfc_c",
                            max_num: 5,
                            "filter": [
                                {"rfc_c": data[0]['RFC']}
                            ]
                        });

                        app.api.call("read", urlCuentas , null, {
                            success: _.bind(function (data) {
                                app.alert.dismiss('validando_duplicados');
                                //Se encontró que RFC ya se encuentra dado de alta
                                if (data.records.length > 0) {
                                    dialog.showConfirm('EL RFC que se está intentando obtener ya se encuentra en el sistema\n¿Desea Consultarlo?', {
                                        callback: function(index) {
                                            if (index === 2) {//Aceptar
                                                app.controller.navigate({
                                                    url: 'Accounts/'+data.records[0].id
                                                });  
                                            }else{
                                                //Habilitando botón para seleccionar qr
                                                $('#boton').removeClass('disabled');
                                                $('#boton').css('pointer-events','auto');
                                            }
                                        }
                                    });

                                }else{
                                    //No se encontró rfc, por lo tanto, el proceso sigue para crear o actualizar Cuenta
                                    app.alert.show('success_rfc', {
                                        level: 'success',
                                        messages: 'Información cargada correctamente',
                                        autoClose: true
                                    });

                                    if(self.desdeCualVista.from=='creacion'){
                                        dialog.showAlert('Será redirigido a la creación de la Cuenta', {
                                            title: 'Información cargada correctamente',
                                            buttonLabels: 'Aceptar'
                                        });

                                        app.controller.navigate({
                                            url: 'Accounts/create',
                                            data:{
                                                dataFromQR:contextoQR.data[0]
                                            }
                                        });

                                    }else{

                                        dialog.showAlert('Será redirigido a la actualización de la Cuenta', {
                                            title: 'Información cargada correctamente',
                                            buttonLabels: 'Aceptar'
                                        });

                                        app.controller.navigate({
                                            url: 'Accounts/'+self.desdeCualVista.idCuenta+'/edit',
                                            data:{
                                                dataFromQR:contextoQR.data[0],
                                                vista:'edit'
                                            }
                                        });
                                    }
                                }
                            }, self)
                        });//Fin api call, para comprobar RFC
                    }
                }else{

                    app.alert.show('error_rfc', {
                        level: 'error',
                        messages: 'La información no se procesó correctamente, favor de elegir otra imagen',
                        autoClose: true
                    });

                    $('#boton').removeClass('disabled');
                    $('#boton').css('pointer-events','auto');

                    $('#send_request').removeClass('disabled');
                    $('#send_request').css('pointer-events','auto');

                }  
            }, self),
            error: _.bind(function (response) {
                app.alert.dismiss('getInfoRFC');
                app.alert.show('error_rfc', {
                    level: 'error',
                    messages: response.textStatus+'\nSe superó el tiempo de espera, favor de intentar nuevamente',
                    autoClose: true
                });

                $('#boton').removeClass('disabled');
                $('#boton').css('pointer-events','auto');

                $('#send_request').removeClass('disabled');
                $('#send_request').css('pointer-events','auto');
            },self)
        },{timeout:90000});
    }

    getFileExt(campo) {
        var name=campo.name;
        var lastDot = name.lastIndexOf('.');
        var fileName = name.substring(0, lastDot);
        var ext = name.substring(lastDot + 1);

        return ext;
    }

    openDialogFile(e){
        $('#file_rfc').trigger('click');
    }

    setImagePreview(e){
        self.readURL($(e.currentTarget)[0]);
        $('#send_request').removeClass('disabled');
        $('#send_request').css('pointer-events','auto');
    }

    readURL(input) {
        if (input.files && input.files[0]) {
            var reader = new FileReader();
            
            reader.onload = function (e) {
                $('#imageRFC_QR').attr('src', e.target.result);
            }
            
            reader.readAsDataURL(input.files[0]);
        }
    }

    abrirDialogoSeleccion(){
        var msj = "¿De dónde desea obtener la imagen para escanear?";
        var titulo = "Escaner de RFC";
        var buttonLabels = "Obtener de Galería,Obtener de cámara";
        navigator.notification.confirm(msj, confirmCallback, titulo, buttonLabels);
        //Fotografia - 2, Galeria -1
        function confirmCallback(buttonIndex) {
            if(buttonIndex==2){
                //self.camaraTomarFoto();
                self.openScannerQR();
            }else{
                self.elegirFotoGaleria();
            }
        }
    }

    openScannerQR(){
        device.scanBarcode(
            result => {
                var url_sat=result.text;
                var res = url_sat.replace(/&/gi, "%26");
                
                var image = document.getElementById('imageRFC_QR');
                image.src = "https://chart.googleapis.com/chart?chs=300x300&cht=qr&chl="+res;

                $('#send_request').removeClass('disabled');
                $('#send_request').css('pointer-events','auto');
                
            },
            error => {
                dialog.showAlert(`Escaneo fallido: ${error}`);
            },
            {
                // preferFrontCamera: true, // iOS and Android
                showFlipCameraButton: true, // iOS and Android
                showTorchButton: true, // iOS and Android
                prompt:
                    'Favor de apuntar a un código QR de  válido de Cédula de identificación Fiscal',
                // Android, display scanned text for X ms. 0 suppresses it
                // entirely, default 1500
                resultDisplayDuration: 500,
                // default: all but PDF_417 and RSS_EXPANDED
                formats: 'QR_CODE,DATA_MATRIX,UPC_E,UPC_A,EAN_13,CODE_128,CODE_39,ITF',
                disableAnimations: true, // iOS
            },
        );
    }

    camaraTomarFoto() {

        var srcType = Camera.PictureSourceType.CAMERA;
        var options = self.setOptionsCamera(srcType);

        navigator.camera.getPicture(onSuccess, onFail, options);

        function onSuccess(imageData) {
            var image = document.getElementById('imageRFC_QR');
            image.src = "data:image/jpeg;base64," + imageData;
        }

        function onFail(message) {
            alert('Failed because: ' + message);
        } 
    }

    elegirFotoGaleria(){

        var srcType = Camera.PictureSourceType.SAVEDPHOTOALBUM;
        var options = self.setOptionsCamera(srcType);

        navigator.camera.getPicture(
            onSuccess, 
            onFail,
            options
        );

        function onSuccess(imageURL) {
            //var image = document.getElementById('imageRFC_QR');
            //image.src = imageURL;
            self.flagGaleria=1;
            window.resolveLocalFileSystemURL(imageURL, 
                function(fileEntry){
                    //alert("got image file entry: " + fileEntry.fullPath);
                    fileEntry.file( 
                        function(file) {
                            let reader = new FileReader();
                            reader.onload = function(e) {
                                $('#imageRFC_QR').attr('src', e.target.result);
                            };

                            reader.onerror = function() {
                                
                            }

                            reader.readAsDataURL(file);
                        },
                        function(error){
                            console.log(error);

                        });
                },
                function(){//error

                }
            );

            $('#send_request').removeClass('disabled');
            $('#send_request').css('pointer-events','auto');
        }

        function onFail(message) {
            self.flagGaleria=0;
            //alert('Failed because: ' + message);
        }
    }

    readImageFromGallery(src) {
        if(src != null && src !=''){
            var file = new File(src, 'unnombre.png');
            var reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = function (e) {
                $('#imageRFC_QR').attr('src', e.target.result);
            }    
        
        }
    }

    setOptionsCamera(srcType) {
        var options = {
            // Some common settings are 20, 50, and 100
            quality: 50,
            destinationType: Camera.DestinationType.FILE_URI,
            // In this app, dynamically set the picture source, Camera or photo gallery
            sourceType: srcType,
            encodingType: Camera.EncodingType.JPEG,
            mediaType: Camera.MediaType.CAMERA,
            //allowEdit: true,
            correctOrientation: true  //Corrects Android orientation quirks
        }
        
        return options;
    }

    getBase64Image(img) {
        // Create canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        // Set width and height
        canvas.width = img.width;
        canvas.height = img.height;
        // Draw the image
        ctx.drawImage(img, 0, 0, canvas.height, canvas.width);
        return canvas.toDataURL('image/png');
    }
    
};

export default ScanQRView;

