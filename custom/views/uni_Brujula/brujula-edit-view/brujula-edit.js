import customization from 'APP/js/core/customization';
import EditView from 'VIEWS/edit/edit-view.js';
import ListView from 'VIEWS/list/list-view';;
import FilteredListView from 'VIEWS/list/filtered-list-view';
import NomadView from 'VIEWS/nomad-view';
import DetailView from 'VIEWS/detail/detail-view.js';


customization.registerListItemDataProvider({
    // Nombre de la plantilla de los items de citas relacionadas
    name: 'related_citas_items',

    prepareItemData(model) {
        // The list item HBS template receives the following object.
        return {
            // Utilizado para encontrar el modelo por id
            itemId: this.buildId(model),

            //Nombres de los elementos a los que se hace referencia en template (related_citas_items.hbs)
            url: model.get('parent_type'),

            cliente: model.get('cliente'),

            estatus: this.getStatus(model),

            //color
            color: this.getColor(model),

        };
    },

    /**
        * Se obtiene un identificador único para cada registro de la lista
        * @param {object} model - Modelo obtenido por cada registro de la lista
    */

    buildId(model) {
        return `citas_${model.id}`;
    },

    // Converts "data-id" HTML attribute value to the ID of a model instance.
    extractId(id) {
        return id.replace('citas_', '');
    },

    /**
        * Se establece color dinámicamente al registro actual de la lita
        * @param {object} model - Modelo obtenido por cada registro de la lista
    */
    getColor(model) {
        var color = '#f75f60';
        var objetivo = model.get('objetivo_c');
        var estatus = model.get('status');
        var resultado = model.get('resultado_c');

        //validación
        if(objetivo && estatus && resultado){
            color = '#1fce6d';
        }
        return color;
    },

    /**
        * Se establece estatus para que se muestre en la lista
        * @param {object} model - Modelo obtenido por cada registro de la lista
    */
    getStatus(model) {

        var estatus = model.get('status');

        /*
        switch(estatus){
            case "1":
            estatus="REALIZADA";
            break;
            case "2":
            estatus="CANCELADA";
            break;
            case "3":
            estatus="REPROGRAMADA";
            break;

            default:
            estatus="";
        }
        */
        switch(estatus){
            case "Planned":
            estatus="PLANIFICADA";
            break;
            case "Held":
            estatus="REALIZADA";
            break;
            case "Not Held":
            estatus="NO REALIZADA";
            break;
            case "1":
            estatus="REALIZADA";
            break;
            case "2":
            estatus="CANCELADA";
            break;
            case "3":
            estatus="REPROGRAMADA";
            break;

            default:
            estatus="";
        }

        return estatus;
    },

});


//Definición de la vista de lista de citas relacionadas a una Persona
class CitasListView extends ListView {

    //Variable global que se llena para mostrar registros en la lista de citas relacionadas
    dataCitas= {};

    initialize(options) {

        //Se obtiene información pasada por FilteredListView
        super.initialize(options);
        this.dataCitas=options.context.attributes.data.dataCitas;

    }
    
    contextMenuDisabled = true;
  
    template = 'related_citas_list';

    listItemDataProvider = 'related_citas_items';

    // Referencia a template que muestra la lista (related_citas_items.hbs).
    listItemTpl = 'related_citas_items';

    // Se sobreescribe función onItemClick para dirigir click hacia nueva vista CitaEditView
    onItemClick(model) {
        // ---- OK onItemClick(model) {
            app.controller.loadScreen({
             isDynamic: true,
             view: CitaEditView,
             data: {
                parentModel: model,
                collection: model.collection,
            },
            context: this.context
        });

    }
};

class CitasFilteredListView extends FilteredListView {
    getListViewDef(options) {
        return _.extend({}, super.getListViewDef(options), {
            view: CitasListView,
        });
    }

    headerConfig = {
        title: 'Citas',
        buttons: {
            save: {label: 'Listo'},
            cancel: {label: 'Regresar'},
        },
    };

    initialize(options){
        super.initialize(options);
        //Se obtienen valores pasados desde vista de edición de Brújula
        this.parentModel = options.data.parentModel;
        this.dataCitas = this.parentModel.collection.models;
    }

    // Override "loadData" method to implement custom logic for fetching data.
    loadData(options) {
        this.collection.reset(this.dataCitas);
    }

    onAfterShow(options){
        var a="test";
        this.collection.reset(this.collection.models);
    }

  //Funcion que se ejecuta al dar click en el botón de Guardar
    onHeaderSaveClick() {
        this.dataCitas = this.collection.models;
        var completa = true;

        //Genera citasCleaned esperadas para establecerlas en campo citas_brujula
        var citasCleaned = [];
        _.each(this.dataCitas, function(key, value) {

            var acompaniante = "";
            var estatus = key.attributes.status; //"";
            var referenciada = "";
            if(!_.isEmpty(key.attributes.acompanante)){
                acompaniante = key.attributes.acompanante;
            }else{
                acompaniante = "Editar";
            }

            // if(key.attributes.status == "Held"){
            //     estatus = "1";
            // }
            // else{
            //     estatus = "";
            // }

            if(key.attributes.referenciada_c == 1){
                referenciada = "checked";
            }

            var duration_minutes = +key.attributes.duration_minutes;
            if(key.attributes.duration_hours != 0){
                var duration_hours =  +key.attributes.duration_hours * 60;

                duration_minutes += duration_hours;
            }

            var nueva_cita = {
                id: key.attributes.id,
                parent_id: key.attributes.parent_id,
                parent_name: key.attributes.cliente,
                duration_minutes: duration_minutes,
                nuevo_traslado: key.attributes.traslado,
                //nuevo_traslado: 0,
                nuevo_referenciada: referenciada,
                nuevo_acompanante: acompaniante,
                nuevo_acompanante_id: key.attributes.user_id_c,
                nuevo_objetivo: key.attributes.objetivo_c,
                nuevo_estatus: estatus,
                nuevo_resultado: key.attributes.resultado_c,
            };
            citasCleaned.push(nueva_cita);
        });

        //Set citas_brujula
        this.parentModel.set("citas_brujula",citasCleaned);
        this.parentModel.set("tiempo_prospeccion",0);

        this.dataCitas = this.collection.models;
        this.parentModel.collection.models=this.dataCitas;

        // Cierra la vista y navega hacia un punto atrás de la historia de navegación
        app.controller.goBack();
    }
};

    /* 
    ** Función para validar que las citas relacionadas tengan establecidos los campos de Objetivo, Estatus y Resultado
    */
    function _validate(fields, errors, callback) {
        if (this.collection.models) {
                var errorCitas = false;
                //Valida citas relacionadas
                if (this.collection.models.length > 0 && this.collection.models[0].attributes.status) {
                this.collection.models.forEach(function(element) {
                    if(element.attributes.objetivo_c && element.attributes.resultado_c && element.attributes.status){
                    //Cita completa
                }else {
                    errorCitas = true;
                }
            });
            }

                //Agrega error a campo custom de citas
                if(errorCitas){
                errors['tct_uni_citas_txf_c'] = {'required':true};
                errors['tct_uni_citas_txf_c']= {'Existen citas sin actualizar':true};
            }

        }
        /*
        if(this.collection.models == null || this.collection.models == undefined || this.collection.models.length==0){

            errors['tct_uni_citas_txf_c'] = {'required':true};
            errors['tct_uni_citas_txf_c']= {'Favor de actualizar citas':true};

        }
        */

        callback(null, fields, errors);
    };

function _duplicateBrujula(fields, errors, callback){

  if(this.flagDuplicate==1){

    errors['fecha_reporte'] = {'required':true};
    errors['fecha_reporte']= {'Ya existe un registro para el promotor seleccionado con la fecha seleccionada':true};
  }
  
  callback(null, fields, errors);
  
};

// Definición de vista de detalle de Brújula
export class BrujulaDetailView extends DetailView {
  onAfterShow(){

    //Se oculta el botón de creación para evitar editar, duplicar y compartir registro de uni_Brujula
      try {
         var menu = $(".createBtn");
         if (menu.length>1) {
             menu[1].classList.add('hide');
         }else if (menu) {
             menu[0].classList.add('hide');
         }
     }
     catch(err) {
         console.log(err.message);
     }

  }
};

export class BrujulaEditView extends EditView {
    dataCitas = null;
    flagDuplicate = null;

    events() {
        return {
            //Definición de nuevo evento click para campo custom de citas
            'click .class_uni_citas input[type="text"]': 'onClickNavigateCitas'
        }   
    }

    initialize(options) {
        super.initialize(options);
        self = this;

        this.model.on("change:fecha_reporte",this.getCitas, this);

        //this.model.on("change:contactos_numero",this.getCitas, this);
        this.model.on("change:contactos_duracion",this.changeDuration, this);
        this.model.on("change:tiempo_prospeccion",this.changeDuration, this);


        //Validación para no permitir guardar brújula en caso de que se haya encontrado duplicada
        this.model.addValidationTask('Valida_brujula_duplicate',_duplicateBrujula.bind(this));
        //Validación para no permitir guardar registro mientras no se hayan generad citas
        this.model.addValidationTask('Valida citas',_validate.bind(this));

    }

    _isValidViaSomeCondition(value) {
        // Put your custom validation code here
        return false;
    }

    render() {
        super.render();
        this.setHeaders();
        this.getCitas();
    }

    //Se establecen los bloques de color azul en la vista de creación en uni_Brujula
    setHeaders() {
        //this.model.set('name','Backlog');
        $( ".bloque1" ).before('<div class="field" style="background-color:#2c97de; color:white"> Contactos/Llamadas </div>' );
        $( ".bloque2" ).before('<div class="field" style="background-color:#2c97de; color:white"> Resultados </div>' );
        $( ".bloque3" ).before('<div class="field" style="background-color:#2c97de; color:white"> Citas </div>' );
        $( ".bloque4" ).before('<div class="field" style="background-color:#2c97de; color:white"> Tiempos (horas)</div>' );
    }

    onAfterShow(){
        if (!this.isCreate) {
            $(".header__btn--save").hide();
            $(".delete").hide();
        }
    }


    /**
     * Función que se ejecuta al dar click en el campo custom tct_uni_citas_txf
     * Carga la vista con la lista de citas relacionadas
     *
     */
    onClickNavigateCitas(h) {
      app.controller.loadScreen({
         isDynamic: true,
         view: CitasFilteredListView,
         data: {
                dataCitas:this.dataCitas,
                //dataCitas:this.collection.models,
                parentModel: this.model,
            },
          //context: this.context,
        });
    }

    /**
     * Función que controla el evento click en el campo Duración minutos
     *
     */
    changeDuration() {
        var total = 0;
        var citas_brujula = this.model.get("citas_brujula");
        var contactos_duracion = this.model.get("contactos_duracion");

        if(contactos_duracion > 0){
            total = +contactos_duracion;
        }

        _.each(citas_brujula, function(key, value) {

            if(key["nuevo_estatus"] == "1") {
                var minutos = +key["duration_minutes"] + +key["nuevo_traslado"];
                if (minutos > 0) {
                    total += minutos;
                }
            }
        });

        total = total / 60;
        this.model.set('tiempo_prospeccion',total);
    }
    
    /*
    * Función que genera la petición hacia API para obtener citas relacionadas a un promotor
    */

    getCitas(){
        /*
        if(this.action == "view"){
            return;
        }
        */
        if (this.isCreate) {
            var fecha = this.model.get("fecha_reporte");
            var Params = {
                'promotor': this.model.get("assigned_user_id"),
                'fecha': this.model.get("fecha_reporte"), //"2018-05-02",
                //'fecha': fecha,
            };

            app.alert.show('brujula_load', {
                level: 'load',
                closeable: false,
                messages: app.lang.get('LBL_LOADING'),
            });

            var Url = app.api.buildURL("Citas_brujula", '', {}, {});

            app.api.call("create", Url, {data: Params}, {
                success: data => {

                  this.flagDuplicate=0;
                    if(data == "Existente"){
                      /*
                        app.alert.show('registro Existente', {
                            level: 'error',
                            messages: 'Ya existe un registro para el promotor seleccionado con la fecha ' + fecha,
                            autoClose: true
                        });
                        */
                        this.model.set("fecha_reporte", this.model.get('fecha_reporte'));
                        this.flagDuplicate=1;
                        return;
                    };



                        //this.dataCitas=data;
                        this.collection.models = data;

                    },
                    error: er => {
                        app.alert.show('api_carga_error', {
                            level: 'error',
                            autoClose: true,
                            messages: 'Error al cargar datos: '+er,
                        });
                    },
                    complete: () => {
                        // if(this.dataCitas){
                            if(this.collection.models){
                            //Se establece el campo asigna_manual_c para mostrar en la vista el campo tct_related_person_txf_c
                            console.log('Peticion completa');

                        }
                        // Oculta alerta hasta que la petición se haya completado
                        app.alert.dismiss('brujula_load');
                    },
                });
        }
    }

};


//Definición de nueva vista para edición de Citas
class CitaEditView extends NomadView {
    // Se especifica el nombre del template
    template = 'citas-edit-view';

    // Configure the header
    headerConfig = {
        title: 'Editar Cita',
        buttons: {
            save: {label: 'Listo'},
            cancel: {label: 'Regresar'},
        },
    };

    //Definición de eventos
    events() {
        return {
            'click .checkbox_default': 'onClickCheck',
            'change select[name="objetivo_list"]': 'onChangeObjetivo',
            'click  .remove_btn': 'removerCita',
        }   
    }

    initialize(options) {

        self = this;
        super.initialize(options);

        this.parentModel = options.data.parentModel;
        this.collection= options.data.collection;

        //this.parentModel = this.context.get('data').parentModel;
        //this.collection= this.context.get('data').collection;

        this.strCliente = options.data.parentModel.get('cliente');
        var duracionHours=options.data.parentModel.get('duration_hours');
        var duracionMinutos=0;
        //Convirtiendo el valor de duration_hours a minutos para mostrarlo en la vista
        if(duracionHours!="0"){
            duracionMinutos=parseInt(duracionHours) * 60;
        }
        var sumaMinutos=duracionMinutos + parseInt(options.data.parentModel.get('duration_minutes'));
        this.strNuevaDuracion=sumaMinutos;

        this.strNuevoTraslado=options.data.parentModel.get('traslado');

        var acompaniante=options.data.parentModel.get('acompanante');
        if(acompaniante==null){
            acompaniante="";
        }
        this.strAcompaniante=acompaniante;

        this.value_check=options.data.parentModel.get('referenciada_c');
        if(this.value_check=="0"){
            this.value_check=parseInt(this.value_check);

        }

        //Obteniendo valores de objetivo, estatus y resultado
        this.strObjetivo=options.data.parentModel.get('objetivo_c');
        this.strEstatus=options.data.parentModel.get('status');
        this.strResultado=options.data.parentModel.get('resultado_c');

        //Cambio estatus
        if (this.strEstatus == 'Held') {
          this.strEstatus = 1;
        }

    }

    onAfterShow(){

        $(".errorObjetivo").hide();
        $(".errorEstatus").hide();
        $(".errorResultado").hide();

        if(this.strObjetivo != null){
            var selectObj=$("select[name='objetivo_list']")[0];
            selectObj.value=this.strObjetivo;
        }
        if(this.strEstatus != null){
            var selectEst=$("select[name='estatus_list']")[0];
            selectEst.value=this.strEstatus;
        }
        if(this.strResultado != null){
            var selectRes=$("select[name='resultado_list']")[0];
            selectRes.value=this.strResultado;
        }

    }

    /*
    * Función que establece el valor en campo "referenciada" dependiendo
    * el valor de checkbox en vista de creación de citas
    */
    onClickCheck(e) {
        if(this.value_check==0){
            //Es la primera vez, se establece como 1
            this.value_check="1";

        }
        else if(this.value_check=="1"){
            this.value_check="0";

        }else{
            this.value_check="1";
        }

    }

    /* 
    * Se obtiene valor de dropdown de objetivo para establecer dependencia de datos con dropdown de resultado
    */
    onChangeObjetivo(e){
        var obj=e.currentTarget.value;

        switch(obj){
            //PRESENTACION
            case "1":
            $("select[name='resultado_list']")
            .html("<option value=''></option>"+
                "<option value='1'>El cliente no estuvo presente, cita cancelada</option>"+
                "<option value='2'>No está interesado</option>"+
                "<option value='3'>Está interesado, pero no en este momento</option>"+
                "<option value='4'>Está Interesado. Se procede a generar expediente</option>"+
                "<option value='5'>Está Interesado. Se agendó otra visita</option>"+
                "<option value='6'>Está Interesado. Se recogió información</option>"+
                "<option value='7'>Se cerró una venta</option>"
                );
            break;
            //EXPEDIENTE
            case "2":
            $("select[name='resultado_list']")
            .html("<option value=''></option>"+
                "<option value='1'>El cliente no estuvo presente, cita cancelada</option>"+
                "<option value='2'>No está interesado</option>"+
                "<option value='3'>Está interesado, pero no en este momento</option>"+
                "<option value='4'>Está Interesado. Se procede a generar expediente</option>"+
                "<option value='5'>Está Interesado. Se agendó otra visita</option>"+
                "<option value='6'>Está Interesado. Se recogió información</option>"+
                "<option value='7'>Se cerró una venta</option>"
                );
            break;
            //INCREMENTO
            case "5":
            $("select[name='resultado_list']")
            .html("<option value=''></option>"+
                "<option value='1'>El cliente no estuvo presente, cita cancelada</option>"+
                "<option value='2'>No está interesado</option>"+
                "<option value='3'>Está interesado, pero no en este momento</option>"+
                "<option value='4'>Está Interesado. Se procede a generar expediente</option>"+
                "<option value='5'>Está Interesado. Se agendó otra visita</option>"+
                "<option value='6'>Está Interesado. Se recogió información</option>"+
                "<option value='7'>Se cerró una venta</option>"
                );
            break;
            //RENOVACION
            case "6":
            $("select[name='resultado_list']")
            .html("<option value=''></option>"+
                "<option value='1'>El cliente no estuvo presente, cita cancelada</option>"+
                "<option value='2'>No está interesado</option>"+
                "<option value='3'>Está interesado, pero no en este momento</option>"+
                "<option value='4'>Está Interesado. Se procede a generar expediente</option>"+
                "<option value='5'>Está Interesado. Se agendó otra visita</option>"+
                "<option value='6'>Está Interesado. Se recogió información</option>"+
                "<option value='7'>Se cerró una venta</option>"
                );
            break;
            //VISITA OCULAR
            case "7":
            $("select[name='resultado_list']")
            .html("<option value=''></option>"+
                "<option value='1'>El cliente no estuvo presente, cita cancelada</option>"+
                "<option value='9'>Se logró la visita ocular parcialmente, se necesita una segunda cita</option>"+
                "<option value='10'>Se logró la visita ocular completa</option>"
                );
            break;
            //COTEJO
            case "8":
            $("select[name='resultado_list']")
            .html("<option value=''></option>"+
                "<option value='1'>El cliente no estuvo presente, cita cancelada</option>"+
                "<option value='11'>Se logró cotejar parcialmente, se necesita una segunda cita</option>"+
                "<option value='12'>Se logró cotejar todos los documentos</option>"
                );
            break;
            //FIRMA DE CONTRATO
            case "10":
            $("select[name='resultado_list']")
            .html("<option value=''></option>"+
                "<option value='1'>El cliente no estuvo presente, cita cancelada</option>"+
                "<option value='15'>Se logró parcialmente, se necesita una segunda cita</option>"+
                "<option value='13'>Se logró completamente</option>"
                );
            break;
            //COBRANZA
            case "4":
            $("select[name='resultado_list']")
            .html("<option value=''></option>"+
                "<option value='1'>El cliente no estuvo presente, cita cancelada</option>"+
                "<option value='14'>Aclaración de pagos</option>"+
                "<option value='16'>No se aclararon los pagos</option>"
                );
            break;
            //OTRO
            case "9":
            $("select[name='resultado_list']")
            .html("<option value=''></option>"+
                "<option value='1'>El cliente no estuvo presente, cita cancelada</option>"+
                "<option value='2'>No está interesado</option>"+
                "<option value='3'>Está interesado, pero no en este momento</option>"+
                "<option value='4'>Está Interesado. Se procede a generar expediente</option>"+
                "<option value='5'>Está Interesado. Se agendó otra visita</option>"+
                "<option value='6'>Está Interesado. Se recogió información</option>"+
                "<option value='7'>Se cerró una venta</option>"
                );
            break;
            //SEGURO
            case "11":
            $("select[name='resultado_list']")
            .html("<option value=''></option>"+
                "<option value='1'>El cliente no estuvo presente, cita cancelada</option>"+
                "<option value='2'>No está interesado</option>"+
                "<option value='3'>Está interesado, pero no en este momento</option>"+
                "<option value='5'>Está Interesado. Se agendó otra visita</option>"+
                "<option value='6'>Está Interesado. Se recogió información</option>"+
                "<option value='7'>Se cerró una venta</option>"
                );
            break;
            //CIERRE
            case "12":
            $("select[name='resultado_list']")
            .html("<option value=''></option>"+
                "<option value='1'>El cliente no estuvo presente, cita cancelada</option>"+
                "<option value='15'>Se logró parcialmente, se necesita una segunda cita</option>"+
                "<option value='13'>Se logró completamente</option>"
                );
            break;
            //VALOR DEFAULT
            default:
            $("select[name='resultado_list']")
            .html("<option value=''></option>");

        }

    }

    /*
    * Función disparada por el evento de remover Cita
    */
    removerCita(){

      //Se obtiene identificador de la cita seleccionada
      var id_cita=this.parentModel.id;
      var citasClone=this.collection;

      //Obtener la posición de la cita seleccionada, dentro del array de citas relacionadas a la brújula
      var position=null;
      for(var i=0;i<this.collection.models.length;i++){
        if(this.collection.models[i].attributes.id==id_cita){
          position=i;
        }

      }

      var positionParentCollection=null;
      for(var j=0;j<this.context.get('collection').models.length;j++){
        if(this.context.get('collection').models[j].attributes.id==id_cita){
          positionParentCollection=j;

        }
      }


      //Eliminando cita seleccionada
      /*
      if( position!=null ){
        this.collection.models.splice(position,1)
      }
      */
      
      //this.collection.remove(this.collection.models[position]);
      //Removiendo item de la lista inicial (this.collection.models) de FilteredListView onAfterShow 
      this.context.get('collection').models.splice(positionParentCollection,1);

      //collectionCitas.remove(this.collection.models[position]);
      
      //Regresando a la vista de lista de las citas relacionadas de la brújula
      app.controller.goBack();
      
        
    }

    /* Valida objetivo, estatus y resultado
    * Manda información de regreso a la vista de lista de Citas con nuevos valores establecidos 
    */
    onHeaderSaveClick() {

        //Ocultando siempre los campos de error y removiendo las clases de error
        $(".errorObjetivo").hide();
        $(".errorEstatus").hide();
        $(".errorResultado").hide();

        $(".fieldObjetivo").removeClass("error");
        $(".fieldEstatus").removeClass("error");
        $(".fieldResultado").removeClass("error");

        if($("select[name='objetivo_list']")[0].value=="") {
            //Agregar color rojo a Objetivo
            $(".fieldObjetivo").addClass("error");
            $(".errorObjetivo").show();
            return;
        }

        if($("select[name='estatus_list']")[0].value=="") {
            //Agregar color rojo a Objetivo
            $(".fieldEstatus").addClass("error");
            $(".errorEstatus").show();
            return;
        }

        if($("select[name='resultado_list']")[0].value=="") {
            //Agregar color rojo a Objetivo
            $(".fieldResultado").addClass("error");
            $(".errorResultado").show();
            return;
        }

        this.parentModel.set('cliente',this.strCliente);
        this.parentModel.set('duration_hours',"0");
        this.parentModel.set('duration_minutes',$('.duracion').val());
        this.parentModel.set('referenciada_c',this.value_check);
        this.parentModel.set('acompaniante',this.strAcompaniante);
        this.parentModel.set('objetivo_c',$("select[name='objetivo_list']")[0].value);
        this.parentModel.set('status',$("select[name='estatus_list']")[0].value);
        this.parentModel.set('resultado_c',$("select[name='resultado_list']")[0].value);
        this.parentModel.set('traslado',$('.traslado').val());

        this.parentModel.collection = this.collection;
        app.controller.goBack();

    }
};

// Registrando nueva ruta citas_edit
customization.registerRoutes([{
    name: 'citas_edit',      // Uniquely identifies the route
    steps: 'Citas_edit',     // Route hash fragment: '#hello'

    handler(options) {
        // Load HelloWorld view when the route is navigated to.
        //app.controller.loadScreen(CitaEditView);

        app.controller.loadScreen({
         isDynamic: true,
         view: CitaEditView,
         data: options.data,
        });
    }
}]);
export default CitaEditView;

customization.register(BrujulaEditView,{module: 'uni_Brujula'});
//export default BrujulaEditView;

customization.register(BrujulaDetailView,{module: 'uni_Brujula'});
//export default BrujulaDetailView;