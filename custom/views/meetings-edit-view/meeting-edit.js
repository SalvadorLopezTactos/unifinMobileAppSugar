
const app = SUGAR.App;
import customization from 'APP/js/core/customization';
import EditView from 'VIEWS/edit/modules/meetings-calls-edit-view';

class MeetingEditView extends EditView {

    fechaInicioTemp = "";

    initialize(options) {
        super.initialize(options);

        //Validación de fecha
        if(this.isCreate){
            this.model.addValidationTask('ValidaFechaPermitida', _.bind(this.validaFechaInicialCall, this));
        }else{
            this.model.addValidationTask('ValidaFechaMayoraInicial', _.bind(this.validaFechaInicial2, this));
        }

        //Validación para identificar si una reunión es marcada como realizada y se agrega cuenta
        this.model.addValidationTask('ValidaRealizadaSinCuenta',_.bind(this.validaRealizada,this));

        //Validación de Resultado de la Reunión
        this.model.addValidationTask('resultadoCitaRequerido',_.bind(this.resultadoCitaRequerido, this));
        this.model.on('sync', this.readOnlyStatus,this);
        this.model.on('sync', this.cambioFecha, this);
        this.model.on('sync', this.disablestatusSync, this);
        this.model.on('sync', this.disableStatus2, this);
        this.model.on('data:sync:complete', this.disableObjective,this); 

    }

    _render(){  
        super._render();

        if(this.isCreate){
            this.disableStatus();
            this.disableAssigned();

            //Se oculta campo de resultado en la creación de la Reunión
            /*Solo será visible el resultado cuando el estado se Realizada o No Realizada*/
            if(this.model.get('status')=='Planned'){
                $('.result_meeting_class').hide();
            }
        }

    }

    cambioFecha() {
        this.fechaInicioTemp = Date.parse(this.model.get("date_start"));
    }

    /* 
     * Valida que la Fecha Inicial no sea menor que la actual
     * 19/09/2018
     */
    validaFechaInicialCall(fields, errors, callback) {

        // FECHA INICIO
        var dateInicio = new Date(this.model.get("date_start"));
        var d = dateInicio.getDate();
        var m = dateInicio.getMonth() + 1;
        var y = dateInicio.getFullYear();
        var fechaCompleta = [m, d, y].join('/');
        // var dateFormat = dateInicio.toLocaleDateString();
        var fechaInicio = Date.parse(fechaCompleta);


        // FECHA ACTUAL
        var dateActual = new Date();
        var d1 = dateActual.getDate();
        var m1 = dateActual.getMonth() + 1;
        var y1 = dateActual.getFullYear();
        var dateActualFormat = [m1, d1, y1].join('/');
        var fechaActual = Date.parse(dateActualFormat);


        if (fechaInicio < fechaActual) {
            app.alert.show("Fecha no valida", {
                level: "error",
                title: "No puedes crear una Llamada con fecha menor al d&Iacutea de hoy",
                autoClose: false
            });

            app.error.errorName2Keys['custom_message1'] = 'La fecha no puede ser menor a la actual';
            errors['date_start'] = errors['date_start'] || {};
            errors['date_start'].custom_message1 = true;
        }
        callback(null, fields, errors);
    }

    /*
    * 
    */

    validaFechaInicial2(fields, errors, callback) {

        // FECHA ACTUAL
        var dateActual = new Date();
        var d1 = dateActual.getDate();
        var m1 = dateActual.getMonth() + 1;
        var y1 = dateActual.getFullYear();
        var dateActualFormat = [m1, d1, y1].join('/');
        var fechaActual = Date.parse(dateActualFormat);

        // FECHA INICIO ANTES DE CAMBIAR
        var dateInicioTmp = new Date(this.fechaInicioTemp);
        var d = dateInicioTmp.getDate();
        var m = dateInicioTmp.getMonth() + 1;
        var y = dateInicioTmp.getFullYear();
        var fechaCompletaTmp = [m, d, y].join('/');
        var fechaInicioTmp = Date.parse(fechaCompletaTmp);

        // FECHA INICIO EN CAMPO
        var dateInicio = new Date(this.model.get("date_start"));
        var d = dateInicio.getDate();
        var m = dateInicio.getMonth() + 1;
        var y = dateInicio.getFullYear();
        var fechaCompleta = [m, d, y].join('/');
        var fechaInicioNueva = Date.parse(fechaCompleta);

        if (fechaInicioTmp != fechaInicioNueva) {
            if (fechaInicioTmp < fechaActual) {
                if (fechaInicioNueva >= fechaInicioTmp) {
                    console.log("Guarda por opcion 1");
                }
                else {
                    app.alert.show("Fecha no valida", {
                        level: "error",
                        title: "No puedes guardar una reunion con fecha menor a la que se habia establecido",
                        autoClose: false
                    });

                    app.error.errorName2Keys['custom_message_date_init0'] = 'No puedes guardar una reunion con fecha menor a la que se habia establecido';
                    errors['date_start'] = errors['date_start'] || {};
                    errors['date_start'].custom_message_date_init0 = true;
                }

            //    callback(null, fields, errors);
            }
            if (fechaInicioTmp >= fechaActual) {
                if (fechaInicioNueva >= fechaActual) {
                    console.log("Guarda por opcion 2")
                }
                else {
                    app.alert.show("Fecha no valida", {
                        level: "error",
                        title: "No puedes agendar reuniones con fecha menor al d&Iacutea de hoy",
                        autoClose: false
                    });

                    app.error.errorName2Keys['custom_message_date_init1'] = 'No puedes agendar reuniones con fecha menor al d&Iacutea de hoy';
                    errors['date_start'] = errors['date_start'] || {};
                    errors['date_start'].custom_message_date_init1 = true;
                }

               // callback(null, fields, errors);
            }
        }
        callback(null, fields, errors);

    }

    /*
    * Función para evitar que el campo "Estado" se desbloquee al escribir en "Descripción" o 
    * en "Relacionado con"
    */
    onAfterShow(options){
      this.disableStatus();
      this.disableAssigned();
    }

    /*
    * Se establecen como solo lectura el "Objetivo" y "Resultado" una vez que se ha sincronizado
    * completamente la información del registro y el Estado sea "Realizada" o "No Realizada"
    */
    disableObjective(){

        if((this.model.get('status')=="Held" && !this.isCreate) || (this.model.get('status')=="Not Held" && !this.isCreate)){

            $('select[name="objetivo_c"]').parent().parent().addClass("field--readonly");
            $('select[name="objetivo_c"]').parent().attr("style","pointer-events:none");

            $('select[name="resultado_c"]').parent().parent().addClass("field--readonly");
            $('select[name="resultado_c"]').parent().parent().attr("style","pointer-events:none");

            //Selector para deshabilitar todos los campos
            $(".field").css("pointer-events", "none");

        }


    }


    /*
    * Se bloquea campo "Estado" al tener registro de Reunión como Realizada o No Realizada
    */

    readOnlyStatus(){

        if((this.model.get('status')=="Held" && !this.isCreate) || (this.model.get('status')=="Not Held" && !this.isCreate)){

            $('select[name="status"]').parent().parent().addClass("field--readonly");
            $('select[name="status"]').parent().attr("style","pointer-events:none");

        }

         //Se bloquea campo "Relacionado con"
        $('.field.fast-click-highlighted>.field__controls--flex').parent().attr('style','pointer-events:none');
        $('.field.fast-click-highlighted>.field__controls--flex').parent().removeClass('fast-click-highlighted');
        $('.field.fast-click-highlighted>.field__controls--flex').parent().addClass("field--readonly");
            
        $('.field.fast-click-highlighted>.field__controls--flex').addClass('field__controls--readonly');
        $('.field.fast-click-highlighted>.field__controls--flex').find(".inert").addClass('hide');
        $('.field.fast-click-highlighted>.field__controls--flex').removeClass('field__controls--flex');

    }

    /*
    * En la creación de registro de Reunión, el "Estado" nace como solo lectura
    */

    disableStatus(){
            $('select[name="status"]').parent().parent().addClass("field--readonly");
            $('select[name="status"]').parent().attr("style", "pointer-events:none");
    }

    disableAssigned(){
        $('.assigned_user_meeting').attr("style", "pointer-events:none");
        $('.assigned_user_meeting').children('.field--relate').removeClass('fast-click-highlighted');
        $('.assigned_user_meeting').children('.field--relate').addClass('field--readonly');
        $('.assigned_user_meeting').children().children('.field__controls').removeClass('field__controls--flex');
        $('.assigned_user_meeting').children().children('.field__controls').addClass('field__controls--readonly');
        $('.assigned_user_meeting').children().find('.btn-group').addClass('hide');

    }

    disablestatusSync() {
        //Recupera valores originales antes de edición
        this.estadoOriginal = this.model.get('status');
        this.parentIdOriginal = this.model.get('parent_id');

        if(Date.parse(this.model.get('date_end'))>Date.now() || app.user.attributes.id!=this.model.get('assigned_user_id')){

            $('span[data-name=status]').css("pointer-events", "none");
        }else{
            $('span[data-name=status]').css("pointer-events", "auto");
        }
    }

    disableStatus2(){
        var arr=[];
        $('input[data-type=time]').each(function(index, elem){
            var a=$(elem).val().split(':');
           
            var seconds = (parseInt(a[0]) * 60 * 60) + (parseInt(a[1]) * 60) ;
            arr.push(seconds);
        });
        //var hour_end=Math.max.apply(null, arr);
        var hour_end=arr[1];
        var date_end=Date.parse(this.model.get('date_end'));
        date_end+=hour_end;

        if(this.model.get('status')!='Held' && this.model.get('status')!="Not Held") {
        
            if (date_end > Date.now() || app.user.attributes.id != this.model.get('assigned_user_id')) {
                $('select[name="status"]').parent().parent().addClass("field--readonly");
                $('select[name="status"]').parent().attr("style", "pointer-events:none");
            } else {
                $('select[name="status"]').parent().parent().removeClass("field--readonly");
                $('select[name="status"]').parent().attr("style", "");
                this.deleteHeldOption();
            }
        }
    
    }

    /*
    * Función que elimina opción de "Realizada" cuando se haya cumplido la hora fin de la Reunión
    */
    deleteHeldOption(){

        $('select[name="status"] option[value="Held"]').remove();
    }

    /*
    * Función para establecer el Resultado de la Reunión como requerido cuando ya ha sido
    * "Realizada" o "No Realizada"
    * */
    resultadoCitaRequerido(fields, errors, callback) {
      if(this.model.get('status')=='Held' || this.model.get('status')=='Not Held'){
        if (this.model.get('resultado_c')=='') {
          app.error.errorName2Keys['requerido_obj'] = 'El resultado de la cita es requerido';
          errors['resultado_c'] = errors['resultado_c'] || {};
          errors['resultado_c'].requerido_obj = true;
          errors['resultado_c'].required = true;
        }
      }
      callback(null, fields, errors);
    }

    /**
      Valida que no permita pasara a realizada y agregar cuetna en la misma edición de la reunión
    */
    validaRealizada(fields, errors, callback){
      //Recupera valores
      if (this.estadoOriginal != "Held" && this.parentIdOriginal == "" && this.model.get('status')=='Held' && this.model.get('parent_type') == 'Accounts' && this.model.get('parent_id') != "" ) {
        errors['status_cuenta'] = 'No es posible actualizar el estado y la cuenta en la misma edición';
        errors['status_cuenta'].required = true;
        app.alert.show("Estado_sin_cuenta",{
            level: "error",
            title: "No es posible actualizar el estado y la cuenta en la misma edici\u00F3n",
            autoClose: false
        });
      }
      callback(null, fields, errors);
    }

};

customization.register(MeetingEditView,{module: 'Meetings'});

export default MeetingEditView;