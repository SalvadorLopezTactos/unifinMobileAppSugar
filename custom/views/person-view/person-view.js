import customization from 'APP/js/core/customization';
import dialog from 'APP/js/core/dialog';
import EditView from 'VIEWS/edit/edit-view.js';

class AccountEditView extends EditView{

    events() {
        return {
            'keyup ._numeric': 'setLengthCurrency',
            'keypress input[type="tel"]': 'isNumberKey'
        }   
    }

    list_check = null;

    simbolos = null;

    usuarios = null;

	initialize(options) {
		super.initialize(options);

        //Mensaje personalizado para validación de página web
        app.error.errorName2Keys['validacion_pagina_web'] = 'ERROR_VALIDACION_PAGINA_WEB';

        this.optionsFromQR=options;

        //Condición para conocer si se el registro es nuevo o ya ha sido creado
        if(this.isCreate){
            //Creando registro  
            var strUrl = 'Users/' + this.model.get('assigned_user_id');
            self=this;
            app.api.call('GET', app.api.buildURL(strUrl), null, {
            	success: _.bind(function (modelo) {
                        //OBTENIENDO PRODUCTOS
                        var productos=modelo.productos_c;
                        if(productos.length>0){
                        	if(productos.indexOf("1") !== -1){
                        		self.model.set('promotorleasing_c',modelo.name);
                        		self.model.set('user_id_c', modelo.id);
                        	}else{
                        		self.model.set('promotorleasing_c','9 - Sin Gestor');
                        		self.model.set('user_id_c','569246c7-da62-4664-ef2a-5628f649537e');
                        	}
                        	if(productos.indexOf("4") !== -1){
                                self.model.set('promotorfactoraje_c',modelo.name);
                                self.model.set('user_id1_c',modelo.id);
                        	}else{
                                self.model.set('promotorfactoraje_c','9 - Sin Gestor');
                                self.model.set('user_id1_c','569246c7-da62-4664-ef2a-5628f649537e');
                        	}
                        	if(productos.indexOf("3") !== -1){
                        		self.model.set('promotorcredit_c',modelo.name);
                        		self.model.set('user_id2_c',modelo.id);
                        	}else {
                        		self.model.set('promotorcredit_c','9 - Sin Gestor');
                        		self.model.set('user_id2_c','569246c7-da62-4664-ef2a-5628f649537e');
                        	}

                            if(productos.indexOf("6") !== -1){
                                self.model.set('promotorfleet_c',modelo.name);
                                self.model.set('user_id6_c',modelo.id);
                            }else {
                                self.model.set('promotorfleet_c', '9 - Sin Gestor');
                                self.model.set('user_id6_c', '569246c7-da62-4664-ef2a-5628f649537e');
                            }

                            if(productos.indexOf("8") !== -1){
                                self.model.set('promotoruniclick_c',modelo.name);
                                self.model.set('user_id7_c',modelo.id);
                            }else {
                                self.model.set('promotoruniclick_c', '9 - Sin Gestor');
                                self.model.set('user_id7_c', '569246c7-da62-4664-ef2a-5628f649537e');
                            }

                            //if(contains.call(modelo.get('productos_c'), "1")==false && contains.call(modelo.get('productos_c'), "3") == false && contains.call(modelo.get('productos_c'), "4") == false){
                            	/*
                                if(productos.indexOf("1") == -1 && productos.indexOf("3") == -1 && productos.indexOf("4") == -1){
                            		self.model.set('promotorleasing_c','9 - Sin Gestor');
                            		self.model.set('user_id_c','569246c7-da62-4664-ef2a-5628f649537e');
                                    self.model.set('promotorfactoraje_c', '9 - Sin Gestor');
                                    self.model.set('user_id1_c', '569246c7-da62-4664-ef2a-5628f649537e');
                            		self.model.set('promotorcredit_c','9 - Sin Gestor');
                            		self.model.set('user_id2_c','569246c7-da62-4664-ef2a-5628f649537e');
                                    //Fleet y uniclick
                                    self.model.set('promotorfleet_c','9 - Sin Gestor');
                                    self.model.set('user_id6_c','569246c7-da62-4664-ef2a-5628f649537e');
                                    self.model.set('promotoruniclick_c','9 - Sin Gestor');
                                    self.model.set('user_id7_c','569246c7-da62-4664-ef2a-5628f649537e');
                            	}
                                */
                            }
                            self._hideGuardar(modelo);

                        }, self)
            });

            
            //Nueva variable para guardar objeto con información de cuenta obtenida por servicio Scan de QR
            // la info es pasada desde fileScanRFC.js
            if(options.data !=undefined){
                if(options.data.dataFromQR != undefined){
                    this.newAccount=options.data.dataFromQR;
                    this.setAccountFromQR(this.newAccount);
                }
            }

        }else{
        //Consultado registro
        //Estableciendo como solo lectura campos de promotores
            this.model.on('sync', this.setPromotores, this);

    	}

        this.getListValues();

        this.model.on('change:name', this.cleanName, this);
        
        //Se agrega este evento para evitar 'BUG' en el que se muestra la palabra 'Teléfonos'
        //en los placeholder
        this.listenTo(this.model,'change', this.deletePlaceholder);

        this.model.on('data:sync:complete', this.setLengthPhone,this);
        //Bloquear registro al tener campo No Contactar
        this.model.on('data:sync:complete', this.blockRecordNoContactar,this);

        //Validación de teléfono
        this.model.addValidationTask('validatePhoneFormat', _.bind(this.validatePhoneFormat, this));

        this.model.addValidationTask('check_info', _.bind(this.doValidateInfoReq, this));
        //Validación para caracteres especiales en campos de nombres
        this.model.addValidationTask('check_TextOnly', _.bind(this.checkTextOnly, this));

        this.model.addValidationTask('validateCanalUniclick', _.bind(this.validateCanalUniclick, this));
        /*RFC_ValidatePadron
          Validación de rfc en el padron de contribuyentes
        */
        /*
        self.rfc_antiguo = "";
        this.model.on('change:rfc_c', this.cambioRFC, this);
        if(this.isCreate){
            this.model.addValidationTask('RFC_validateP', _.bind(this.RFC_ValidatePadronCreacion, this));
        }else{
            this.model.addValidationTask('RFC_validateP', _.bind(this.RFC_ValidatePadron, this));
        }
        */

        /***************Valida Campo de Página Web ****************************/
        this.model.addValidationTask('validaPaginaWeb', _.bind(this.validaPagWeb, this));
        
        //validación para mostrar en texto el nombre de los campos requeridos
        this.model.addValidationTask('valida_requeridos',_.bind(this.valida_requeridos, this));

        //Validación de duplicados
        this.model.addValidationTask('duplicate_check', _.bind(this.DuplicateCheck, this));
        
    }

    setAccountFromQR(newAccount){
        //Comprobar si es Persona Moral
        //Sección para QR de Persona Moral
        if(newAccount['Denominación o Razón Social']!= undefined){
            //Establecer tipo de Persona Moral
            this.model.set('tipodepersona_c','Persona Moral');
            this.model.set('razonsocial_c',newAccount['Denominación o Razón Social']);
            this.model.set('nombre_comercial_c',newAccount['Denominación o Razón Social']);

            if(newAccount['Correo electrónico'] !="" && newAccount['Correo electrónico'] !=undefined){
                this.model.set('email', [{email_address: newAccount['Correo electrónico'], primary_address: true}]);  
            }

            if(newAccount['RFC']!="" && newAccount['RFC']!=undefined){
                this.model.set('rfc_c',newAccount['RFC']);
            }

            if(newAccount['Fecha de Inicio de operaciones'] !="" && newAccount['Fecha de Inicio de operaciones'] !=undefined){
                var fechaInicio=newAccount['Fecha de Inicio de operaciones'];
                //Formateando fecha a Y-m-d viene como d-m-Y
                var fec=fechaInicio.split('-');
                this.model.set('fechaconstitutiva_c',fec[2]+'-'+fec[1]+'-'+fec[0]);
            }

            this.model.set('path_img_qr_c',newAccount['path_img_qr']);

            /*ToDo: 'Entidad Federativa' campo sugar: zonageografica_c*/

        }else{//Sección para Persona Física o PFAE

            this.model.set('tipodepersona_c','Persona Fisica');
            
            if(newAccount['Nombre']!="" && newAccount['Nombre']!=undefined){
                this.model.set('primernombre_c',newAccount['Nombre']);
            }

            if(newAccount['Apellido Paterno']!="" && newAccount['Apellido Paterno']!=undefined){
                this.model.set('apellidopaterno_c',newAccount['Apellido Paterno']);
            }
            
            if(newAccount['Apellido Materno']!="" && newAccount['Apellido Materno']!=undefined){
                this.model.set('apellidomaterno_c',newAccount['Apellido Materno']);
            }

            if(newAccount['Entidad Federativa']!="" && newAccount['Entidad Federativa']!=undefined){
                var valorEdoNacimiento=this.searchEstado(newAccount['Entidad Federativa']);
                this.model.set('estado_nacimiento_c',valorEdoNacimiento);
            }

            if(newAccount['CURP']!="" && newAccount['CURP']!=undefined){
                this.model.set('curp_c',newAccount['CURP']);
            }
            
            if(newAccount['RFC']!="" && newAccount['RFC']!=undefined){
                this.model.set('rfc_c',newAccount['RFC']);
            }

            if(newAccount['Fecha Nacimiento']!="" && newAccount['Fecha Nacimiento'] != undefined){
                var fechaNac=newAccount['Fecha Nacimiento'];
                //Formateando fecha a Y-m-d viene como d-m-Y
                var fec=fechaNac.split('-');
                this.model.set('fechadenacimiento_c',fec[2]+'-'+fec[1]+'-'+fec[0]);
            }
            if(newAccount['Correo electrónico'] !="" && newAccount['Correo electrónico'] !=undefined){
                this.model.set('email', [{email_address: newAccount['Correo electrónico'], primary_address: true}]);  
            }

            this.model.set('path_img_qr_c',newAccount['path_img_qr']);
        }
    }

    searchEstado(valorBuscado){
        var paises_list=App.lang.getAppListStrings('estados_list');
        if(valorBuscado=='CIUDAD DE MEXICO'){
            valorBuscado='DISTRITO FEDERAL';
        }
        if(valorBuscado=='MEXICO'){
            valorBuscado='ESTADO DE MEXICO';
        }
        var llave='';
        for(var key in paises_list) {
            if(paises_list[key] == valorBuscado) {
                llave=key;
            }
        }
        return llave;
    }

    /*Función generada para obtener los valores de las listas validacion_duplicados_list y validacion_simbolos_list a través de un api call
    ya que dichos valores no se están obteniendo desde metadata con app.lang.getAppListStrings
    */
    getListValues(){
        self=this;
        app.alert.show('getlists', {
                level: 'process',
                messages: 'Cargando...'
            });
        app.api.call('GET', app.api.buildURL('GetDropdownList/validacion_duplicados_list'), null, {
                success: _.bind(function (data) {
                    app.alert.dismiss('getlists');
                    if (data) {
                        self.list_check=data;
                        
                    }
                }, self),
            });

        app.alert.show('getlists', {
                level: 'process',
                messages: 'Cargando...'
            });
        app.api.call('GET', app.api.buildURL('GetDropdownList/validacion_simbolos_list'), null, {
                success: _.bind(function (data) {
                    app.alert.dismiss('getlists');
                    if (data) {
                        self.simbolos=data;
                        
                    }
                }, this),
            });

        app.alert.show('getlists', {
                level: 'process',
                messages: 'Cargando...'
            });
        app.api.call('GET', app.api.buildURL('GetDropdownList/usuarios_homonimo_name_list'), null, {
                success: _.bind(function (data) {
                    app.alert.dismiss('getlists');
                    if (data) {
                        self.usuarios=data;
                        
                    }
                }, this),
            });

    }

    onAfterShow(){

        window.cargaVistaCreacion++;
        //Se establece función para evitar 'bug' que hace que se muestre 'Teléfonos' en el placeholder
        $('input').removeAttr('placeholder');
        $('span.placeholder:contains("Teléfonos")').html("");

        //Se establece vacío el campo Macrosector tal y como se tiene en versión Web
        $('select[name="tct_macro_sector_ddw_c"]').val('');

        //Se dispara manualmente evento change para evitar error de requerido en campo de origen
        $('select[name="origen_cuenta_c"]').trigger('change');

        if (App.user.attributes.deudor_factoraje_c != true) {
            //Readonly check factoraje
           $('.field__label:contains("Deudor Factoraje")').parent().find('input').eq(0).attr('style','pointer-events:none');
        }

    }

    setLengthCurrency(e){
        //Se establece longitud máxima para campos de moneda
        $(e.currentTarget).attr('maxlength','15');
    }

    cleanName(){
        self=this;
        //Recupera variables
        var original_name = this.model.get("name");
        //var list_check = app.lang.getAppListStrings('validacion_duplicados_list');
        //var simbolos = app.lang.getAppListStrings('validacion_simbolos_list');
        //Define arreglos para guardar nombre de cuenta
            var clean_name_split = [];
            var clean_name_split_full = [];
            clean_name_split = original_name.split(" ");
            //Elimina simbolos: Ej. . , -
            _.each(clean_name_split, function (value, key) {
                _.each(self.simbolos, function (simbolo, index) {
                    var clean_value = value.split(simbolo).join('');
                    if (clean_value != value) {
                        clean_name_split[key] = clean_value;
                    }
                });
            });
            clean_name_split_full = App.utils.deepCopy(clean_name_split);

        if (this.model.get('tipodepersona_c')=="Persona Moral") {
            //Elimina tipos de sociedad: Ej. SA, de , CV...
            var totalVacio = 0;
            _.each(clean_name_split, function (value, key) {
                _.each(self.list_check, function (index, nomenclatura) {
                    var upper_value = value.toUpperCase();
                    if (upper_value == nomenclatura) {
                        var clean_value = upper_value.replace(nomenclatura, "");
                        clean_name_split[key] = clean_value;
                    }
                });
            });
            //Genera clean_name con arreglo limpio
            var clean_name = "";
            _.each(clean_name_split, function (value, key) {
                clean_name += value;
                //Cuenta elementos vacíos
                if (value == "") {
                    totalVacio++;
                }
            });

            //Valida que exista más de un elemento, caso cotrarioe establece para clean_name valores con tipo de sociedad
            if ((clean_name_split.length - totalVacio) <= 1) {
                clean_name = "";
                _.each(clean_name_split_full, function (value, key) {
                    clean_name += value;
                });
            }
            clean_name = clean_name.toUpperCase();
            this.model.set("clean_name", clean_name);
        }else{
            original_name = original_name.replace(/\s+/gi,'');
            original_name= original_name.toUpperCase();
            this.model.set("clean_name", original_name);
        }
    }

    /*
    * Función para evitar bug en el que se muestra Teléfonos como placeholder en todos los campos
    */
    deletePlaceholder(){
        //Se establece función para evitar 'bug' que hace que se muestre 'Teléfonos' en el placeholder
        //Oculta placeholder a campos de texto
        $('input').removeAttr('placeholder');

        //Oculta placeholder a campos desplegables
        $('span.placeholder:contains("Teléfonos")').addClass('hide');
    }

    _hideGuardar(modelo){

        //Agregando longitud máxima a campo de teléfono
        $('input[type="tel"]').attr('maxlength',"10");

        var tipo = this.model.get('tipo_registro_cuenta_c');
        var puesto = modelo.puestousuario_c;
        //var puesto = app.user.attributes.type;
        //tipo 2 - Prospecto, 3 - Cliente
        if((tipo=="2" || tipo=="3") && (puesto==6 || puesto==12 || puesto==17))
        {
            $(".header__btn--save").addClass("hide")
        }
        else
        {
            $(".header__btn--save").removeClass("hide")
        }
    }

    setPromotores() {

  	    $('.promotor_class').attr('style','pointer-events: none;');

    }

    blockRecordNoContactar(){

        if (this.model.get('tct_no_contactar_chk_c') == true) {

            //Bloquear el registro completo y mostrar alerta
            $('.field').addClass('field--readonly');
            $('.field').attr('style','pointer-events:none');

            //Bloqueo de botón Guardar
            $('.header__btn--save ').addClass('disabled').attr('style','pointer-events:none');

            app.alert.show("cuentas_no_contactar", {
                level: "error",
                messages: "Cuenta No Contactable\nCualquier duda o aclaraci\u00F3n, favor de contactar al \u00E1rea de Administraci\u00F3n de cartera",
                autoClose: false
            });

        }

        //Se oculta el botón de eliminar
        $('.edit__footer').children().hide();

        this.setUpdateValuesFromQR();
    }


    setUpdateValuesFromQR(){
    /*ToDo:
        Agregar validación cuando se intente actualizar con QR 
        desde una PM a una PF o viceversa, 
        en ese caso mandar mensaje de advertencia, indicando esta actualización
    */
        if(this.optionsFromQR.data!=undefined){
            if(this.optionsFromQR.data.vista!=undefined && this.optionsFromQR.data.vista=='edit'){
                var valoresNuevos=this.optionsFromQR.data.dataFromQR;
                var mensajeActualizar='Se actualizarán los siguientes campos:\n';
                var nombre='';
                //Obtener los valores de los campos para Persona Moral
                if(valoresNuevos['Denominación o Razón Social']!= undefined){
                    var regimenFiscal=this.model.get('tipodepersona_c');
                    //Obtener valores actuales
                    var nombreComercial=this.model.get('nombre_comercial_c');
                    var razonSocial=this.model.get('razonsocial_c');
                    var email=this.model.get('email1');
                    var rfc=this.model.get('rfc_c');
                    var fechaInicio=this.model.get('fechaconstitutiva_c');
                    //Valores nuevos
                    var valoresParaActualizar={};
                    var nombreComercialNuevo=valoresNuevos['Denominación o Razón Social'];
                    var razonSocialNuevo=valoresNuevos['Denominación o Razón Social'];
                    var emailNuevo=valoresNuevos['Correo electrónico'];
                    var rfcNuevo=valoresNuevos['RFC'];
                    var fechaInicioNuevo=valoresNuevos['Fecha de Inicio de operaciones'];

                    var path_img_qr=valoresNuevos['path_img_qr'];
                    
                    if(regimenFiscal!='Persona Moral'){ //Diferente regimen fiscal- Actual tiene PF o PFAE y el nuevo es PM
                        var mensajeActualizarDiferenteRegimen='El Régimen Fiscal es diferente al registro actual.\nNo es posible actualizar\n';
                        dialog.showAlert(mensajeActualizarDiferenteRegimen, {
                            title: 'Información no válida',
                                    buttonLabels: 'Cerrar'
                                });
                        app.controller.navigate({
                            url: 'Accounts/'+self.model.get('id')
                        });

                    }else{//Régimen Actual es PM y el nuevo es igual PM
                        valoresParaActualizar['Denominación o Razón Social']=nombreComercial;
                        if(nombreComercial != nombreComercialNuevo && nombreComercialNuevo !=''){
                            mensajeActualizar+='Nombre Comercial\n';
                            mensajeActualizar+='Actual: '+nombreComercial+' - Nuevo: '+nombreComercialNuevo+'\n\n';
                            valoresParaActualizar['Denominación o Razón Social']=nombreComercialNuevo;
                        }

                        if(email != emailNuevo && emailNuevo !=''){
                            mensajeActualizar+='Correo electrónico\n';
                            mensajeActualizar+='Actual: '+email+' - Nuevo: '+emailNuevo+'\n\n';
                            valoresParaActualizar['Correo electrónico']=emailNuevo;
                        }

                        if(rfc != rfcNuevo && rfcNuevo !=''){
                            mensajeActualizar+='RFC\n';
                            mensajeActualizar+='Actual: '+rfc+' - Nuevo: '+rfcNuevo+'\n\n';
                            valoresParaActualizar['RFC']=rfcNuevo;
                        }

                        if(fechaInicio != fechaInicioNuevo && fechaInicioNuevo !=''){
                            mensajeActualizar+='Fecha constitutiva\n';
                            mensajeActualizar+='Actual: '+fechaInicio+' - Nuevo: '+fechaInicioNuevo+'\n\n';
                            valoresParaActualizar['Fecha de Inicio de operaciones']=fechaInicioNuevo;
                        }

                        valoresParaActualizar['path_img_qr']=path_img_qr;

                        if(mensajeActualizar!='Se actualizarán los siguientes campos:\n'){
                            dialog.showConfirm(mensajeActualizar+'\n¿Desea proceder?', {
                                buttonLabels: ['Cancelar','Proceder'],
                                callback: function(index) {
                                    if (index === 2) {//Aceptar
                                        self.setAccountFromQR(valoresParaActualizar);
                                        self.optionsFromQR.data.vista=undefined;

                                    }else{//Cancelar
                                        //Regresar a detalle en caso de no confirmar
                                        app.controller.navigate({
                                            url: 'Accounts/'+self.model.get('id')
                                        });
                                    }
                                }
                            });
                        }
                    }
                }else{//Valores para personas PF o PFAE
                    var regimenFiscal=this.model.get('tipodepersona_c');

                    //Obteniendo valores actuales
                    var nombre=this.model.get('primernombre_c');
                    var paterno=this.model.get('apellidopaterno_c');
                    var materno=this.model.get('apellidomaterno_c');
                    var fechaNac=this.model.get('fechadenacimiento_c');
                    var estadoNac=this.model.get('estado_nacimiento_c');
                    var curp=this.model.get('curp_c');
                    var email=this.model.get('email1');
                    var rfc=this.model.get('rfc_c');

                    var valoresParaActualizar={};

                    //Obteniendo valores del servicio
                    var nombreNuevo=valoresNuevos['Nombre'];
                    var paternoNuevo=valoresNuevos['Apellido Paterno'];
                    var maternoNuevo=valoresNuevos['Apellido Materno'];
                    var fechaNacNuevo=valoresNuevos['Fecha Nacimiento'];
                    var estadoNacNuevo=valoresNuevos['Entidad Federativa'];
                    var curpNuevo=valoresNuevos['CURP'];
                    var emailNuevo=valoresNuevos['Correo electrónico'];
                    var rfcNuevo=valoresNuevos['RFC'];

                    var path_img_qr=valoresNuevos['path_img_qr'];

                    if(regimenFiscal=='Persona Moral'){
                        var mensajeActualizarDiferenteRegimen='El Régimen Fiscal es diferente al registro actual.\nNo es posible actualizar\n';
                        dialog.showAlert(mensajeActualizarDiferenteRegimen, {
                            title: 'Información no válida',
                                    buttonLabels: 'Cerrar'
                                });
                        app.controller.navigate({
                            url: 'Accounts/'+self.model.get('id')
                        });
                    }else{//Registro actual y registro nuevo tiene mismo régimen fiscal PF o PFAE
                        valoresParaActualizar['Nombre']=nombre;
                        if(nombre != nombreNuevo && nombreNuevo !=''){
                            mensajeActualizar+='Nombre\n';
                            mensajeActualizar+='Actual: '+nombre+' - Nuevo: '+nombreNuevo+'\n\n';
                            valoresParaActualizar['Nombre']=nombreNuevo;
                        }

                        if(paterno != paternoNuevo && paternoNuevo !=''){
                            mensajeActualizar+='Apellido Paterno\n';
                            mensajeActualizar+='Actual: '+paterno+' - Nuevo: '+paternoNuevo+'\n\n';
                            valoresParaActualizar['Apellido Paterno']=paternoNuevo;
                        }

                        if(materno != maternoNuevo && maternoNuevo !=''){
                            mensajeActualizar+='Apellido Materno\n';
                            mensajeActualizar+='Actual: '+materno+' - Nuevo: '+maternoNuevo+'\n\n';
                            valoresParaActualizar['Apellido Materno']=maternoNuevo;
                        }

                        if(fechaNac != fechaNacNuevo && fechaNacNuevo !=''){
                            mensajeActualizar+='Fecha de nacimiento\n';
                            mensajeActualizar+='Actual: '+fechaNac+' - Nuevo: '+fechaNacNuevo+'\n\n';
                            valoresParaActualizar['Fecha Nacimiento']=fechaNacNuevo;
                        }

                        if(estadoNac != estadoNacNuevo && estadoNacNuevo !=''){
                            mensajeActualizar+='Estado de nacimiento\n';
                            mensajeActualizar+='Actual: '+estadoNac+' - Nuevo: '+estadoNacNuevo+'\n\n';
                            valoresParaActualizar['Entidad Federativa']=estadoNacNuevo;
                        }

                        if(curp != curpNuevo && curpNuevo !=''){
                            mensajeActualizar+='Curp\n';
                            mensajeActualizar+='Actual: '+curp+' - Nuevo: '+curpNuevo+'\n\n';
                            valoresParaActualizar['CURP']=curpNuevo;
                        }

                        if(email != emailNuevo && emailNuevo !=''){
                            mensajeActualizar+='Correo electrónico\n';
                            mensajeActualizar+='Actual: '+email+' - Nuevo: '+emailNuevo+'\n\n';
                            valoresParaActualizar['Correo electrónico']=emailNuevo;
                        }

                        if(rfc != rfcNuevo && rfcNuevo !=''){
                            mensajeActualizar+='RFC\n';
                            mensajeActualizar+='Actual: '+rfc+' - Nuevo: '+rfcNuevo+'\n\n';
                            valoresParaActualizar['RFC']=rfcNuevo;
                        }

                        valoresParaActualizar['path_img_qr']=path_img_qr;

                        if(mensajeActualizar!='Se actualizarán los siguientes campos:\n'){
                            dialog.showConfirm(mensajeActualizar+'\n¿Quiere proceder?', {
                                buttonLabels: ['Cancelar','Proceder'],
                                callback: function(index) {
                                    if (index === 2) {//Aceptar
                                        self.setAccountFromQR(valoresParaActualizar);
                                        self.optionsFromQR.data.vista=undefined;
                                    }else{//Cancelar
                                    //Regresar a detalle en caso de no confirmar
                                        app.controller.navigate({
                                            url: 'Accounts/'+self.model.get('id')
                                        });
                                    }
                                }
                            });
                        }
                    }
                }   
            }
        }
    }

    setLengthPhone(){
        //Agregando longitud máxima a campo de teléfono
        $('input[type="tel"]').attr('maxlength',"10");
    }

    isNumberKey(evt){
        var charCode = (evt.which) ? evt.which : event.keyCode

        if (charCode > 31 && (charCode < 48 || charCode > 57)){
            return false;
        }
        
        return true;
    }

    validatePhoneFormat(fields, errors, callback){

        var expreg =/^[0-9]{8,10}$/;

        if( this.model.get('phone_office') != "" && this.model.get('phone_office') != undefined){

            if(!expreg.test(this.model.get('phone_office'))){
                errors['phone_office'] = {'required':true};
                errors['phone_office']= {'Formato incorrecto, el tel\u00E9fono debe contener entre 8 y 10 d\u00EDgitos.':true};
            }

            var cont=0;

            var lengthTel=this.model.get('phone_office').length;
            var num_tel=this.model.get('phone_office');
        
            //Checando número de teléfono con únicamente caracteres repetidos
            var arr_nums_tel=num_tel.split(num_tel.charAt(0));

            if( arr_nums_tel.length-1 == lengthTel ){
            errors['phone_office'] = {'required':true};
            errors['phone_office']= {'Tel\u00E9fono Inv\u00E1lido, caracteres repetidos':true};
            }

        }
                
        callback(null, fields, errors);   

    }

    doValidateInfoReq(fields, errors, callback){
        // Prospeccion propia -> 3
        if (this.model.get('origen_cuenta_c') == '3') {
                var metodoProspeccion = new String(this.model.get('prospeccion_propia_c'));
                if (metodoProspeccion.length == 0 || this.model.get('prospeccion_propia_c') == null) {
                    /*app.alert.show("Metodo de Prospeccion Requerido", {
                        level: "error",
                        title: "Debe indicar el metodo de prospecci\u00F3n",
                        autoClose: false
                    });*/
                    errors['prospeccion_propia_c'] = errors['prospeccion_propia_c'] || {};
                    errors['prospeccion_propia_c'].required = true;
                }
            }
            callback(null, fields, errors);
    }

    checkTextOnly(fields, errors, callback){

            var camponame= "";
            var expresion = new RegExp(/^[a-zA-ZÀ-ÿ\s]*$/g);
            if (this.model.get('primernombre_c')!="" && this.model.get('primernombre_c')!=undefined){
                var nombre=this.model.get('primernombre_c');
                var comprueba = expresion.test(nombre);
                if(comprueba!= true){
                    camponame= camponame + '-Primer Nombre\n';
                    errors['primernombre_c'] = errors['primernombre_c'] || {};
                    errors['primernombre_c'].required = true;
                }
            }
            if (this.model.get('apellidopaterno_c')!="" && this.model.get('apellidopaterno_c')!= undefined){
                var apaterno=this.model.get('apellidopaterno_c');
                var expresion = new RegExp(/^[a-zA-ZÀ-ÿ\s]*$/g);
                var validaap = expresion.test(apaterno);
                if(validaap!= true){
                    camponame= camponame + '-Apellido Paterno\n';
                    errors['apellidopaterno_c'] = errors['apellidopaterno_c'] || {};
                    errors['apellidopaterno_c'].required = true;
                }
            }
            if (this.model.get('apellidomaterno_c')!="" && this.model.get('apellidomaterno_c')!= undefined){
                var amaterno=this.model.get('apellidomaterno_c');
                var expresion = new RegExp(/^[a-zA-ZÀ-ÿ\s]*$/g);
                var validaam = expresion.test(amaterno);
                if(validaam!= true){
                    camponame= camponame + '-Apellido Materno\n';
                    errors['apellidomaterno_c'] = errors['apellidomaterno_c'] || {};
                    errors['apellidomaterno_c'].required = true;
                }
            }
            callback(null, fields, errors);

            if (camponame && !_.isEmpty(errors)){
                //Se utiliza dialog ya que al utilizar app.alert.show, como entra en función callback
                //el msj se oculta y no se alcanza a ver el detalle del error
                dialog.showAlert('Los siguientes campos no permiten caracteres especiales:\n'+ camponame);
            }
    }

    validateCanalUniclick(fields, errors, callback){

            var valorCanal=$(".canalUniclick").val();
            var faltantesUniclickCanal = 0;
            var userprod = (app.user.attributes.productos_c).replace(/\^/g, "");


            if (valorCanal=="0" && userprod.includes('8') || valorCanal=="" && userprod.includes('8')) {
                $(".canalUniclick").parent().parent().addClass('error');
                faltantesUniclickCanal += 1;
            }
            else {
                $(".canalUniclick").parent().parent().removeClass('error');
            }
            if (faltantesUniclickCanal > 0) {
                //dialog.showAlert('Hace falta seleccionar algún canal para el producto Uniclick');
                errors['error_UniclickCanal'] = errors['error_UniclickCanal'] || {};
                errors['error_UniclickCanal'].required = true;
            }

            callback(null, fields, errors);

            if (faltantesUniclickCanal > 0) {
                dialog.showAlert('Hace falta seleccionar algún canal para el producto Uniclick');
            }
    }

    cambioRFC(){
            var original_rfc = this.model._previousAttributes.rfc_c;
            this._set_rfc_antiguo(original_rfc);
    }

    _get_rfc_antiguo(){
            return self.rfc_antiguo;
    }

    _set_rfc_antiguo(rfca){
            self.rfc_antiguo = rfca;
    }

    RFC_ValidatePadron(fields, errors, callback) {
            const contextoRFC = this;

            app.alert.show('obteniendoEstadoRFC', {
                    level: 'process',
                    messages: 'Cargando...'
                });

            var urlgetEstadoRFC= app.api.buildURL("Accounts/", null, null, {
                                fields: "rfc_c,estado_rfc_c",
                                max_num: 1,
                                "filter": [
                                    {"id": this.model.get('id')}
                                ]
                            });

            app.api.call('GET', urlgetEstadoRFC, null, {
                    success: _.bind(function (data) {
                        app.alert.dismiss('obteniendoEstadoRFC');
                        if (data.records.length > 0) {
                            var rfc = this.getField('rfc_c');
                            //Se agrega país para omitir validación de RFC cuando el registro no sea de México
                            //this.model.set('estado_rfc_c','5',{silent: true});
                            var pais=self.model.get('pais_nacimiento_c');
                            var estado_rfc=data.records[0].estado_rfc_c;
                            var valuerfc = self.model.get('rfc_c');
                            var anticrfc = self._get_rfc_antiguo();

                            if(valuerfc != anticrfc && (estado_rfc==undefined || estado_rfc ==null || estado_rfc =="" || estado_rfc ==0 ) && valuerfc != "" && valuerfc!= undefined && pais=="2" && this.isCreate||
                                (estado_rfc==undefined || estado_rfc ==null || estado_rfc =="" || estado_rfc ==0 ) && valuerfc != "" && valuerfc!= undefined && pais=="2" && !this.isCreate ||
                                (valuerfc != anticrfc && valuerfc !="" && valuerfc != undefined && !this.isCreate && estado_rfc=='1' && pais=="2")){
                                app.alert.show('getValidationRFC', {
                                    level: 'load',
                                    closeable: false,
                                    messages: 'Validando RFC...',
                                });
                                var url=app.api.buildURL('GetRFCValido?rfc='+valuerfc);
                                app.api.call('GET', url,null, {
                                    success: function (data) {
                                        app.alert.dismiss('getValidationRFC');
                                        if (data != "" && data != null) {
                                        if(data.code == '1') {
                                            self.model.set('estado_rfc_c', "");
                                            self.model.attributes.estado_rfc_c="";
                                            app.alert.show("Error Validar RFC", {
                                                    level: "error",
                                                    title: 'Estructura del RFC incorrecta',
                                                    autoClose: false
                                            });
                                            dialog.showAlert('Estructura del RFC incorrecta\n');
                                            errors['rfc_c'] = errors['rfc_c'] || {};
                                            errors['rfc_c'].required = true;

                                            }else if (data.code == '2') {
                                                self.model.set('estado_rfc_c', '0');
                                                self.model.attributes.estado_rfc_c='0';
                                                app.alert.show("Error Validar RFC", {
                                                    level: "error",
                                                    title: 'RFC no registrado en el padrón de contribuyentes',
                                                    autoClose: false
                                                });
                                                dialog.showAlert('RFC no registrado en el padrón de contribuyentes\n');
                                                errors['rfc_c'] = errors['rfc_c'] || {};
                                                errors['rfc_c'].required = true;
                                            }else if(data.code == '3'){//RFC válido, pero no es susceptible a recibir facturas
                                                self.model.set('estado_rfc_c', '1');
                                                //contextoRFC.model.set('estado_rfc_c', '1');
                                                //contextoRFC.context.attributes.model.attributes.estado_rfc_c='1';
                                            
                                            }else if (data.code == '4') {
                                                self.model.set('estado_rfc_c', '1');
                                            }                     
                                        }else{
                                            app.alert.show("Error Validar RFC", {
                                                level: "error",
                                                title: 'Error de envío para validar RFC\nServicio no disponible\nFavor de intentar nuevamente',
                                                autoClose: false
                                            });

                                            dialog.showAlert('Error de envío para validar RFC\nServicio no disponible\nFavor de intentar nuevamente');
                                            errors['error_RFC_Padron'] = errors['error_RFC_Padron'] || {};
                                            errors['error_RFC_Padron'].required = true;
                                        }
                                        callback(null, fields, errors);                 
                                    },
                                    error: function (error) {
                                        app.alert.dismiss('getValidationRFC');
                                        app.alert.show("Error Validar RFC", {
                                            level: "error",
                                            title: 'Error de envío',
                                            autoClose: false
                                        });

                                        dialog.showAlert('Error de envío para validar RFC\n');
                                        errors['rfc_c'] = errors['rfc_c'] || {};
                                        errors['rfc_c'].required = true;
                                        callback(null, fields, errors);
                                    },
                                },{timeout:60000});
            
                            }else{
                                callback(null, fields, errors);
                            }
                        }
                }, self),
            });//Fin api call para obtener estado_Rfc             
    }

    RFC_ValidatePadronCreacion(fields, errors, callback){
        if(self.model.get('rfc_c')!=undefined && self.model.get('rfc_c') !=""){
            var rfc = this.getField('rfc_c');
            //Se agrega país para omitir validación de RFC cuando el registro no sea de México
            //this.model.set('estado_rfc_c','5',{silent: true});
            var pais=self.model.get('pais_nacimiento_c');
            var estado_rfc=self.model.get('estado_rfc_c');
            var valuerfc = self.model.get('rfc_c');
            var anticrfc = self._get_rfc_antiguo();

            if(valuerfc != anticrfc && (estado_rfc==undefined || estado_rfc ==null || estado_rfc =="" || estado_rfc ==0 ) && valuerfc != "" && valuerfc!= undefined && pais=="2" && this.isCreate||
                (estado_rfc==undefined || estado_rfc ==null || estado_rfc =="" || estado_rfc ==0 ) && valuerfc != "" && valuerfc!= undefined && pais=="2" && !this.isCreate ||
                (valuerfc != anticrfc && valuerfc !="" && valuerfc != undefined && !this.isCreate && estado_rfc=='1' && pais=="2")){
                app.alert.show('getValidationRFC', {
                    level: 'load',
                    closeable: false,
                    messages: 'Validando RFC...',
                });
                var url=app.api.buildURL('GetRFCValido?rfc='+valuerfc);
                app.api.call('GET', url,null, {
                    success: function (data) {
                        app.alert.dismiss('getValidationRFC');
                        if (data != "" && data != null) {
                            if(data.code == '1') {
                                self.model.set('estado_rfc_c', "");
                                self.model.attributes.estado_rfc_c="";
                                app.alert.show("Error Validar RFC", {
                                    level: "error",
                                    title: 'Estructura del RFC incorrecta',
                                    autoClose: false
                                });
                                dialog.showAlert('Estructura del RFC incorrecta\n');
                                errors['rfc_c'] = errors['rfc_c'] || {};
                                errors['rfc_c'].required = true;

                            }else if (data.code == '2') {
                                self.model.set('estado_rfc_c', '0');
                                self.model.attributes.estado_rfc_c='0';
                                app.alert.show("Error Validar RFC", {
                                    level: "error",
                                    title: 'RFC no registrado en el padrón de contribuyentes',
                                    autoClose: false
                                });
                                dialog.showAlert('RFC no registrado en el padrón de contribuyentes\n');
                                errors['rfc_c'] = errors['rfc_c'] || {};
                                errors['rfc_c'].required = true;
                            
                            }else if(data.code == '3'){//RFC válido, pero no es susceptible a recibir facturas
                                
                                self.model.set('estado_rfc_c', '1');
                            
                            }else if (data.code == '4') {
                                self.model.set('estado_rfc_c', '1');
                            }                     
                        }else{
                            app.alert.show("Error Validar RFC", {
                                level: "error",
                                title: 'Error de envío para validar RFC\nServicio no disponible\nFavor de intentar nuevamente',
                                autoClose: false
                            });
                            dialog.showAlert('Error de envío para validar RFC\nServicio no disponible\nFavor de intentar nuevamente');
                            errors['error_RFC_Padron'] = errors['error_RFC_Padron'] || {};
                            errors['error_RFC_Padron'].required = true;
                        }
                        callback(null, fields, errors);                 
                    },
                    error: function (error) {
                        app.alert.dismiss('getValidationRFC');
                        app.alert.show("Error Validar RFC", {
                            level: "error",
                            title: 'Error de envío',
                            autoClose: false
                        });

                        dialog.showAlert('Error de envío para validar RFC\n');
                        errors['rfc_c'] = errors['rfc_c'] || {};
                        errors['rfc_c'].required = true;
                        callback(null, fields, errors);
                    },
                },{timeout:60000});            
            }else{
                callback(null, fields, errors);
            }
        }else{
            callback(null, fields, errors); 
        }
    }

    /*************Valida campo de Página Web*****************/
    validaPagWeb(fields, errors, callback) {

        var webSite = this.model.get('website');
        if (webSite != "") {

            var expreg = /^(https?:\/\/)?([\da-z\.-i][\w\-.]+)\.([\da-z\.i]{1,6})([\/\w\.=#%?-]*)*\/?$/;
            if (!expreg.test(webSite)) {

                dialog.showAlert("El formato de Página Web no es válido");
                //Pinta el campo de color rojo pra evitar mostrar mensaje de "Campo requerido"
                $('label.field__label:contains("Página Web")').parent().addClass('error');
                errors['website'] = errors['website'] || {};
                errors['website'].validacion_pagina_web = true;
                callback(null, fields, errors);
            } else {
                app.api.call('GET', app.api.buildURL('validacion_sitio_web/?website=' + webSite), null, {
                    success: _.bind(function (data) {
                        //console.log(data);
                        if (data == "02") {
                            app.alert.show("error-website", {
                                level: "error",
                                autoClose: false,
                                messages: "El dominio ingresado en Página Web no existe."
                            });
                            dialog.showAlert("El dominio ingresado en Página Web no existe");
                            $('label.field__label:contains("Página Web")').parent().addClass('error');
                            errors['website'] = errors['website'] || {};
                            errors['website'].validacion_pagina_web = true;
                            //callback(null, fields, errors);
                        }
                        if (data == "01") {
                            app.alert.show("error-website", {
                                level: "error",
                                autoClose: false,
                                messages: "El dominio ingresado en Página Web no existe o no esta activa."
                            });
                            dialog.showAlert("El dominio ingresado en Página Web no existe o no esta activa.");
                            $('label.field__label:contains("Página Web")').parent().addClass('error');
                            errors['website'] = errors['website'] || {};
                            errors['website'].validacion_pagina_web = true;
                            //callback(null, fields, errors);
                        }
                        callback(null, fields, errors);
                    }, this),
                });
            }
        } else {
            callback(null, fields, errors);
        }
    }

    valida_requeridos(fields, errors, callback) {
        var campos = "";
        _.each(errors, function(value, key) {
            _.each(this.model.fields, function(field) {
                if(_.isEqual(field.name,key)) {
                    if(field.vname) {
                        if(field.vname == 'LBL_PAIS_NACIMIENTO_C' && this.model.get('tipodepersona_c') == 'Persona Moral')
                        {
                          campos = campos + 'País de constitución\n';
                        }
                        else
                        {
                          if(field.vname == 'LBL_ESTADO_NACIMIENTO' && this.model.get('tipodepersona_c') == 'Persona Moral')
                          {
                            campos = campos + 'Estado de constitución\n';
                          }
                          else
                          {
                            campos = campos + '' + app.lang.get(field.vname, "Accounts") + '\n';
                          }
                        }
                    }
                  }
            }, this);
        }, this);
        //Remueve campos custom: Teléfonos, Direcciones, Correo
        campos = campos.replace("Telefonos\n","");
        campos = campos.replace("Direcciones\n","");
        campos = campos.replace("Dirección de Correo Electrónico\n","");
        if(campos) {
            app.alert.show("Campos Requeridos", {
                level: "error",
                messages: "Hace falta completar la siguiente información en la Cuenta:\n" + campos,
                autoClose: false
            });
        }
        callback(null, fields, errors);

        if (campos){
            //Se utiliza dialog ya que al utilizar app.alert.show, como entra en función callback
            //el msj se oculta y no se alcanza a ver el detalle del error
            dialog.showAlert('Hace falta completar la siguiente información en la Cuenta:\n' + campos);
        }
    }

    DuplicateCheck(fields, errors, callback) {
        self=this;
        //Aplicar validación solo cuando ya no existen campos requeridos por llenar
        if(_.isEmpty(errors)){

            //Valida homonimo
            if (this.model.get('tct_homonimo_chk_c') != true) {
                var clean_name = this.model.get('clean_name');

                app.alert.show('validando_duplicados', {
                    level: 'process',
                    messages: 'Cargando...'
                });

                var urlCuentas= app.api.buildURL("Accounts/", null, null, {
                    fields: "clean_name",
                    max_num: 5,
                    "filter": [
                        {
                            "clean_name": clean_name,
                            "id": {
                                $not_equals: this.model.id,
                            }
                        }
                    ]
                })

                app.api.call("read", urlCuentas , null, {
                    success: _.bind(function (data) {
                        app.alert.dismiss('validando_duplicados');
                        if (data.records.length > 0) {
                            //var usuarios = App.lang.getAppListStrings('usuarios_homonimo_name_list');
                            var etiquetas = "";
                            Object.keys(self.usuarios).forEach(function (key) {
                                if (key != '') {
                                    etiquetas += self.usuarios[key] + '\n';
                                }
                            });
                            //Se establece un campo 'nombre' que no existe para solo llenar el arreglo errors
                            //y evitar que se guarde el registro, sin pintar de color rojo ningún campo (tal y como funciona en web)
                            errors['nombre'] = errors['nombre'] || {};
                            errors['nombre'].required = true;

                            //Se muestra alerta de esta manera ya que al llegar al callback, el alert.show se oculta y no es posible ver el detalle del error
                            dialog.showAlert("Ya existe una persona registrada con el mismo nombre.\nFavor de comunicarse con alguno de los siguientes usuarios:\n" + etiquetas + "");

                            if(!_.isEmpty(errors)){

                                app.alert.show("DuplicateCheck", {
                                    level: "error",
                                    messages: "Ya existe una persona registrada con el mismo nombre.\nFavor de comunicarse con alguno de los siguientes usuarios:\n" + etiquetas + "",
                                    autoClose: false
                                });
                                        
                            }
                        }
                        callback(null, fields, errors);
                    }, this)
                });
            } else {
                callback(null, fields, errors);
            }

        }else{

            callback(null, fields, errors);

        }
        
    }

    /*
    * Se establece función para setear en el modelo con la información obtenida de uni_Productos, 
    * obtenida desde el campo custom no_viable.js
    */
    onHeaderSaveClick() {
        //Se establece variable con valor de App.tipoProducto, llenada previamente con respuesta de
        //Api en archivo no_viable.js dentro de la función =>(getProductsInfo)
        this.tipoProducto = App.tipoProducto;

        if (this.model.get('id') != "" && this.model.get('id') != undefined ) {
                //Inicializando objeto de Leasing
                if ($('#checkbox_no_viable').attr('checked')) {
                    var objLeasing = {
                        'id': this.tipoProducto.leasing.id, //Id
                        'no_viable': $('#checkbox_no_viable').attr('checked'),
                        'no_viable_razon': $('#razon_nv_leasing').val(), //lista Razón de Lead no viable 
                        'no_viable_razon_fp': $('#fuera_perfil_razon_leasing').val(), //lista Fuera de Perfil (Razón) 
                        'no_viable_quien': $('#competencia_quien_leasing').val(), //texto ¿Quién? 
                        'no_viable_porque': $('#competencia_porque_leasing').val(), //texto ¿Por qué? 
                        'no_viable_producto': $('#que_producto_leasing').val(), //lista ¿Qué producto? 
                        'no_viable_razon_cf': $('#cond_financieras_leasing').val(), //lista Condiciones Financieras 
                        'no_viable_otro_c': $('#especifique_producto_leasing').val(), //texto ¿Qué producto? 
                        'no_viable_razon_ni': $('#no_interesado_leasing').val(), //lista Razón No se encuentra interesado 
                        'assigned_user_id': 'cc736f7a-4f5f-11e9-856a-a0481cdf89eb'// Asigna a usuario '9 - No Viable' en Uni_Productos
                    };

                    this.tipoProducto.leasing = objLeasing;
                    //Se reasigna el usuario Leasing de la cuenta a usuario 9 - No Viable
                    this.model.set('promotorleasing_c', '9 - No Viable');
                    this.model.set('user_id_c', 'cc736f7a-4f5f-11e9-856a-a0481cdf89eb');
                }else{
                    var objLeasing = {
                        'id': this.tipoProducto.leasing.id, //Id
                        'no_viable': $('#checkbox_no_viable').attr('checked'),
                        'no_viable_razon': '', //lista Razón de Lead no viable 
                        'no_viable_razon_fp': '', //lista Fuera de Perfil (Razón) 
                        'no_viable_quien': '', //texto ¿Quién? 
                        'no_viable_porque': '', //texto ¿Por qué? 
                        'no_viable_producto': '', //lista ¿Qué producto? 
                        'no_viable_razon_cf': '', //lista Condiciones Financieras 
                        'no_viable_otro_c': '', //texto ¿Qué producto? 
                        'no_viable_razon_ni': '', //lista Razón No se encuentra interesado 
                        'assigned_user_id': this.tipoProducto.leasing.assigned_user_id // Asigna a usuario '9 - No Viable' en Uni_Productos
                    };

                    this.tipoProducto.leasing = objLeasing;

                }

                //Inicializando objeto de Factoraje
                if ($('#checkbox_no_viable_factoraje').attr('checked')) {
                    var objFactoring = {
                        'id': this.tipoProducto.factoring.id, //Id
                        'no_viable': $('#checkbox_no_viable_factoraje').attr('checked'),
                        'no_viable_razon': $('#razon_nv_factoraje').val(), //lista Razón de Lead no viable 
                        'no_viable_razon_fp': $('#fuera_perfil_razon_factoraje').val(), //lista Fuera de Perfil (Razón) 
                        'no_viable_quien': $('#competencia_quien_factoraje').val(), //texto ¿Quién? 
                        'no_viable_porque': $('#competencia_porque_factoraje').val(), //texto ¿Por qué? 
                        'no_viable_producto': $('#que_producto_factoraje').val(), //lista ¿Qué producto? 
                        'no_viable_razon_cf': $('#cond_financieras_factoraje').val(), //lista Condiciones Financieras
                        'no_viable_otro_c': $('#especifique_producto_factoraje').val(), //texto ¿Qué producto?
                        'no_viable_razon_ni': $('#no_interesado_factoraje').val(), //lista Razón No se encuentra interesado
                        'assigned_user_id': 'cc736f7a-4f5f-11e9-856a-a0481cdf89eb' // Asigna a usuario '9 - No Viable' en Uni_Productos
                    };

                    this.tipoProducto.factoring = objFactoring;
                    //Se reasigna el usuario Factoraje de la cuenta a usuario 9 - No Viable
                    this.model.set('promotorfactoraje_c', '9 - No Viable');
                    this.model.set('user_id1_c', 'cc736f7a-4f5f-11e9-856a-a0481cdf89eb');
                }else{

                    var objFactoring = {
                        'id': this.tipoProducto.factoring.id, //Id
                        'no_viable': $('#checkbox_no_viable_factoraje').attr('checked'),
                        'no_viable_razon': '', //lista Razón de Lead no viable 
                        'no_viable_razon_fp': '', //lista Fuera de Perfil (Razón) 
                        'no_viable_quien': '', //texto ¿Quién? 
                        'no_viable_porque': '', //texto ¿Por qué? 
                        'no_viable_producto': '', //lista ¿Qué producto? 
                        'no_viable_razon_cf': '', //lista Condiciones Financieras
                        'no_viable_otro_c': '', //texto ¿Qué producto?
                        'no_viable_razon_ni': '', //lista Razón No se encuentra interesado
                        'assigned_user_id': this.tipoProducto.factoring.assigned_user_id // Asigna a usuario '9 - No Viable' en Uni_Productos
                    };

                    this.tipoProducto.factoring = objFactoring;

                }

                //Inicializando objeto de Crédito
                if ($('#checkbox_no_viable_credito').attr('checked')) {
                    var objCredito = {
                        'id': this.tipoProducto.credito_auto.id, //Id 
                        'no_viable': $('#checkbox_no_viable_credito').attr('checked'),
                        'no_viable_razon': $('#razon_nv_credito').val(), //lista Razón de Lead no viable 
                        'no_viable_razon_fp': $('#fuera_perfil_razon_credito').val(), //lista Fuera de Perfil (Razón) 
                        'no_viable_quien': $('#competencia_quien_credito').val(), //texto ¿Quién? 
                        'no_viable_porque': $('#competencia_porque_credito').val(), //texto ¿Por qué? 
                        'no_viable_producto': $('#que_producto_credito').val(), //lista ¿Qué producto? 
                        'no_viable_razon_cf': $('#cond_financieras_credito').val(), //lista Condiciones Financieras 
                        'no_viable_otro_c': $('#especifique_producto_credito').val(), //texto ¿Qué producto? 
                        'no_viable_razon_ni': $('#no_interesado_credito').val(), //lista Razón No se encuentra interesado 
                        'assigned_user_id': 'cc736f7a-4f5f-11e9-856a-a0481cdf89eb' // Asigna a usuario '9 - No Viable' en Uni_Productos
                    };

                    this.tipoProducto.credito_auto = objCredito;
                    this.model.set('promotorcredit_c', '9 - No Viable');
                    this.model.set('user_id2_c', 'cc736f7a-4f5f-11e9-856a-a0481cdf89eb');
                }else{

                    var objCredito = {
                        'id': this.tipoProducto.credito_auto.id, //Id 
                        'no_viable': $('#checkbox_no_viable_credito').attr('checked'),
                        'no_viable_razon': '', //lista Razón de Lead no viable 
                        'no_viable_razon_fp': '', //lista Fuera de Perfil (Razón) 
                        'no_viable_quien': '', //texto ¿Quién? 
                        'no_viable_porque': '', //texto ¿Por qué? 
                        'no_viable_producto': '', //lista ¿Qué producto? 
                        'no_viable_razon_cf': '', //lista Condiciones Financieras 
                        'no_viable_otro_c': '', //texto ¿Qué producto? 
                        'no_viable_razon_ni': '', //lista Razón No se encuentra interesado 
                        'assigned_user_id': this.tipoProducto.credito_auto.assigned_user_id // Asigna a usuario '9 - No Viable' en Uni_Productos
                    };

                    this.tipoProducto.credito_auto = objCredito;

                }

                //Inicializando objeto de Fleet
                if ($('#checkbox_no_viable_fleet').attr('checked')) {
                    var objFleet = {
                        'id': this.tipoProducto.fleet.id, //Id 
                        'no_viable': $('#checkbox_no_viable_fleet').attr('checked'),
                        'no_viable_razon': $('#razon_nv_fleet').val(), //lista Razón de Lead no viable 
                        'no_viable_razon_fp': $('#fuera_perfil_razon_fleet').val(), //lista Fuera de Perfil (Razón) 
                        'no_viable_quien': $('#competencia_quien_fleet').val(), //texto ¿Quién? 
                        'no_viable_porque': $('#competencia_porque_fleet').val(), //texto ¿Por qué? 
                        'no_viable_producto': $('#que_producto_fleet').val(), //lista ¿Qué producto? 
                        'no_viable_razon_cf': $('#cond_financieras_fleet').val(), //lista Condiciones Financieras 
                        'no_viable_otro_c': $('#especifique_producto_fleet').val(), //texto ¿Qué producto? 
                        'no_viable_razon_ni': $('#no_interesado_fleet').val(), //lista Razón No se encuentra interesado 
                        'assigned_user_id': 'cc736f7a-4f5f-11e9-856a-a0481cdf89eb' // Asigna a usuario '9 - No Viable' en Uni_Productos
                    };

                    this.tipoProducto.fleet = objFleet;
                    this.model.set('promotorfleet_c', '9 - No Viable');
                    this.model.set('user_id6_c', 'cc736f7a-4f5f-11e9-856a-a0481cdf89eb');
                }else{

                    var objFleet = {
                        'id': this.tipoProducto.fleet.id, //Id 
                        'no_viable': $('#checkbox_no_viable_fleet').attr('checked'),
                        'no_viable_razon': '', //lista Razón de Lead no viable 
                        'no_viable_razon_fp': '', //lista Fuera de Perfil (Razón) 
                        'no_viable_quien': '', //texto ¿Quién? 
                        'no_viable_porque': '', //texto ¿Por qué? 
                        'no_viable_producto': '', //lista ¿Qué producto? 
                        'no_viable_razon_cf': '', //lista Condiciones Financieras 
                        'no_viable_otro_c': '', //texto ¿Qué producto? 
                        'no_viable_razon_ni': '', //lista Razón No se encuentra interesado
                        'assigned_user_id': this.tipoProducto.fleet.assigned_user_id // Asigna a usuario '9 - No Viable' en Uni_Productos
                    };

                    this.tipoProducto.fleet = objFleet;

                }

                //Inicializando objeto de Uniclick
                if ($('#checkbox_no_viable_uniclick').attr('checked')) {
                    var objUniclick = {
                        'id': this.tipoProducto.uniclick.id, //Id 
                        'no_viable': $('#checkbox_no_viable_uniclick').attr('checked'),
                        'no_viable_razon': $('#razon_nv_uniclick').val(), //lista Razón de Lead no viable 
                        'no_viable_razon_fp': $('#fuera_perfil_razon_uniclick').val(), //lista Fuera de Perfil (Razón) 
                        'no_viable_quien': $('#competencia_quien_uniclick').val(), //texto ¿Quién? 
                        'no_viable_porque': $('#competencia_porque_uniclick').val(), //texto ¿Por qué? 
                        'no_viable_producto': $('#que_producto_uniclick').val(), //lista ¿Qué producto? 
                        'no_viable_razon_cf': $('#cond_financieras_uniclick').val(), //lista Condiciones Financieras 
                        'no_viable_otro_c': $('#especifique_producto_uniclick').val(), //texto ¿Qué producto? 
                        'no_viable_razon_ni': $('#no_interesado_uniclick').val(), //lista Razón No se encuentra interesado 
                        'assigned_user_id': 'cc736f7a-4f5f-11e9-856a-a0481cdf89eb' // Asigna a usuario '9 - No Viable' en Uni_Productos
                    };

                    this.tipoProducto.uniclick = objUniclick;
                    this.model.set('promotoruniclick_c', '9 - No Viable');
                    this.model.set('user_id7_c', 'cc736f7a-4f5f-11e9-856a-a0481cdf89eb');
                }else{

                    var objUniclick = {
                        'id': this.tipoProducto.uniclick.id, //Id 
                        'no_viable': $('#checkbox_no_viable_uniclick').attr('checked'),
                        'no_viable_razon': '', //lista Razón de Lead no viable 
                        'no_viable_razon_fp': '', //lista Fuera de Perfil (Razón) 
                        'no_viable_quien': '', //texto ¿Quién? 
                        'no_viable_porque': '', //texto ¿Por qué? 
                        'no_viable_producto': '', //lista ¿Qué producto? 
                        'no_viable_razon_cf': '', //lista Condiciones Financieras 
                        'no_viable_otro_c': '', //texto ¿Qué producto? 
                        'no_viable_razon_ni': '', //lista Razón No se encuentra interesado 
                        'assigned_user_id': this.tipoProducto.uniclick.assigned_user_id // Asigna a usuario '9 - No Viable' en Uni_Productos
                    };

                    this.tipoProducto.uniclick = objUniclick;

                }

                //Agregando canal uniclick en objeto que viaja a uni_Productos
                this.tipoProducto.uniclick.canal_c=$(".canalUniclick").val();


                //Establece el objeto para guardar
                this.model.set('account_uni_productos', this.tipoProducto);
                this.context.attributes.model.attributes.no_viable=this.tipoProducto;

        }else{
            //Agregando canal uniclick en objeto que viaja a uni_Productos
            this.tipoProducto.uniclick.canal_c=$(".canalUniclick").val();

            //Establece el objeto para guardar
            this.model.set('account_uni_productos', this.tipoProducto);
            this.context.attributes.model.attributes.no_viable=this.tipoProducto;
        }

        this.model.set('estado_rfc_c','0');

        super.onHeaderSaveClick();
    }
};

customization.register(AccountEditView,{module: 'Accounts'});
export default AccountEditView;

