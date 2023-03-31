import customization from 'APP/js/core/customization';
import EditView from 'VIEWS/edit/edit-view.js';
import dialog from 'APP/js/core/dialog';

class LeadEditView extends EditView {

    events() {
        return {
            'keypress input[type="tel"]': 'isNumberKeyLeads'
        }   
    }

    list_check = null;

    simbolos = null;

	initialize(options) {
		super.initialize(options);

		this.getListValues();

        this.model.on('change:name_c', this.cleanName, this);        

        //Bloquear registro al tener campo No Contactar
        this.model.on('data:sync:complete', this.blockLeadConvertido,this);

        //Validación para caracteres especiales en campos de nombres
        this.model.addValidationTask('check_TextOnlyLeads', _.bind(this.checkTextOnlyLeads, this));

        //Validación de teléfono
        this.model.addValidationTask('validatePhoneFormatLeads', _.bind(this.validatePhoneFormatLeads, this));

        //validación para mostrar en texto el nombre de los campos requeridos
        this.model.addValidationTask('check_Requeridos', _.bind(this.valida_requeridos, this));

        //Validación de duplicados
        this.model.addValidationTask('duplicate_check_leads', _.bind(this.duplicateCheckLeads, this));
        
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
    }

    onAfterShow(){
    	//Condición generada para evitar error que se presentaba cuando
    	//Se guardaba, el campo se seguía pidiendo como requerido aunque éste ya tuviera valor en el front
    	if(this.model.get('origen_c')==null){

    		this.model.set('origen_c',"");
    	}

    }

    isNumberKeyLeads(evt){
    	var charCode = (evt.which) ? evt.which : event.keyCode;

    	if (charCode > 31 && (charCode < 48 || charCode > 57)){
    		return false;
    	}
    	return true;
	}

    cleanName(){
    	self=this;
        //Recupera variables
        var original_name = this.model.get("name_c");
        //var list_check = app.lang.getAppListStrings('validacion_duplicados_list');
        //var simbolos = app.lang.getAppListStrings('validacion_simbolos_list');
        //Define arreglos para guardar nombre de lead
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

        if (this.model.get('regimen_fiscal_c') == "Persona Moral") {
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

            //Valida que exista más de un elemento, caso contrario establece para clean_name_c valores con tipo de sociedad
            if ((clean_name_split.length - totalVacio) <= 1) {
                clean_name = "";
                _.each(clean_name_split_full, function (value, key) {
                    clean_name += value;
                });
            }
            clean_name = clean_name.toUpperCase();
            this.model.set("clean_name_c", clean_name);
        } else {
            original_name = original_name.replace(/\s+/gi, '');
            original_name = original_name.toUpperCase();
            this.model.set("clean_name_c", original_name);
        }
    }

    blockLeadConvertido(){
    	if (this.model.get('lead_cancelado_c') == '1' && this.model.get('subtipo_registro_c') == '3') {
    		//Bloquear el registro completo y mostrar alerta
    		$('.field').addClass('field--readonly');
    		$('.field').attr('style','pointer-events:none');

    		//Bloqueo de botón Guardar
    		$('.header__btn--save ').addClass('disabled').attr('style','pointer-events:none');
    		app.alert.show("lead_bloqueado", {
    			level: "error",
    			messages: "Lead No Editable\nEste registro ha sido bloqueado pues se encuentra como Cancelado",
    			autoClose: false
	         });
        }

	    if (this.model.get('subtipo_registro_c') == '4') {

	            //Bloquear el registro completo y mostrar alerta
	            $('.field').addClass('field--readonly');
	            $('.field').attr('style','pointer-events:none');

	            //Bloqueo de botón Guardar
	            $('.header__btn--save ').addClass('disabled').attr('style','pointer-events:none');
	           
	            app.alert.show("lead_convertido", {
	                level: "error",
	                messages: "Lead No Editable\nEste registro ha sido bloqueado pues ya ha sido Convertido",
	                autoClose: false
	            });

	    }

	    //Se oculta el botón de eliminar
	    $('.edit__footer').children().hide();
	}

	checkTextOnlyLeads(fields, errors, callback){

		var camponame = "";
        var expresion = new RegExp(/^[a-zA-ZÀ-ÿ\s]*$/g);

        if (this.model.get('nombre_c') != "" && this.model.get('nombre_c') != undefined) {
            var nombre = this.model.get('nombre_c');
            var comprueba = expresion.test(nombre);
            if (comprueba != true) {
                camponame = camponame + '' + app.lang.get("LBL_NOMBRE", "Leads") + '\n';
                errors['nombre_c'] = errors['nombre_c'] || {};
                errors['nombre_c'].required = true;
            }
        }
        if (this.model.get('apellido_paterno_c') != "" && this.model.get('apellido_paterno_c') != undefined) {
            var apaterno = this.model.get('apellido_paterno_c');
            var expresion = new RegExp(/^[a-zA-ZÀ-ÿ\s]*$/g);
            var validaap = expresion.test(apaterno);
            if (validaap != true) {
                camponame = camponame + '' + app.lang.get("LBL_APELLIDO_PATERNO_C", "Leads") + '\n';
                errors['apellido_paterno_c'] = errors['apellido_paterno_c'] || {};
                errors['apellido_paterno_c'].required = true;
            }
        }
        if (this.model.get('apellido_materno_c') != "" && this.model.get('apellido_materno_c') != undefined) {
            var amaterno = this.model.get('apellido_materno_c');
            var expresion = new RegExp(/^[a-zA-ZÀ-ÿ\s]*$/g);
            var validaam = expresion.test(amaterno);
            if (validaam != true) {
                camponame = camponame + '' + app.lang.get("LBL_APELLIDO_MATERNO_C", "Leads") + '\n';
                errors['apellido_materno_c'] = errors['apellido_materno_c'] || {};
                errors['apellido_materno_c'].required = true;
            }
        }
        if (camponame) {
            app.alert.show("Error_validacion_Campos", {
                level: "error",
                messages: 'Los siguientes campos no permiten Caracteres Especiales y Números:\n' + camponame,
                autoClose: false
            });

            dialog.showAlert('Los siguientes campos no permiten Caracteres Especiales y Números:\n'+ camponame);
        }
        callback(null, fields, errors);
	}

	validatePhoneFormatLeads(fields, errors, callback){

		var expreg =/^[0-9]{8,10}$/;

		//Teléfono móvil
		if( this.model.get('phone_mobile') != "" && this.model.get('phone_mobile') != undefined){
			
			if(!expreg.test(this.model.get('phone_mobile'))){
				errors['phone_mobile'] = {'required':true};
				errors['phone_mobile']= {'Formato incorrecto, el tel\u00E9fono debe contener entre 8 y 10 d\u00EDgitos.':true};
			}
			var cont=0;

			var lengthTel=this.model.get('phone_mobile').length;
			var num_tel=this.model.get('phone_mobile');
		
			//Checando número de teléfono con únicamente caracteres repetidos
			var arr_nums_tel=num_tel.split(num_tel.charAt(0));

			if( arr_nums_tel.length-1 == lengthTel ){
				errors['phone_mobile'] = {'required':true};
				errors['phone_mobile']= {'Tel\u00E9fono Inv\u00E1lido, caracteres repetidos':true};
			}

		}

		//Teléfono de casa
		if( this.model.get('phone_home') != "" && this.model.get('phone_home') != undefined){
			
			if(!expreg.test(this.model.get('phone_home'))){
				errors['phone_home'] = {'required':true};
				errors['phone_home']= {'Formato incorrecto, el tel\u00E9fono debe contener entre 8 y 10 d\u00EDgitos.':true};
			}
			var cont=0;

			var lengthTel=this.model.get('phone_home').length;
			var num_tel=this.model.get('phone_home');
		
			//Checando número de teléfono con únicamente caracteres repetidos
			var arr_nums_tel=num_tel.split(num_tel.charAt(0));

			if( arr_nums_tel.length-1 == lengthTel ){
				errors['phone_home'] = {'required':true};
				errors['phone_home']= {'Tel\u00E9fono Inv\u00E1lido, caracteres repetidos':true};
			}

		}

		//Teléfono de oficina
		if( this.model.get('phone_work') != "" && this.model.get('phone_work') != undefined){
			
			if(!expreg.test(this.model.get('phone_work'))){
				errors['phone_work'] = {'required':true};
				errors['phone_work']= {'Formato incorrecto, el tel\u00E9fono debe contener entre 8 y 10 d\u00EDgitos.':true};
			}
			var cont=0;

			var lengthTel=this.model.get('phone_work').length;
			var num_tel=this.model.get('phone_work');
		
			//Checando número de teléfono con únicamente caracteres repetidos
			var arr_nums_tel=num_tel.split(num_tel.charAt(0));

			if( arr_nums_tel.length-1 == lengthTel ){
				errors['phone_work'] = {'required':true};
				errors['phone_work']= {'Tel\u00E9fono Inv\u00E1lido, caracteres repetidos':true};
			}

		}
              
    	callback(null, fields, errors);

	}

	valida_requeridos(fields, errors, callback) {
        var campos = "";
        var subTipoLead = this.model.get('subtipo_registro_c');
        var tipoPersona = this.model.get('regimen_fiscal_c');
        var campos_req = ['origen_c'];

        switch (subTipoLead) {
            /*******SUB-TIPO SIN CONTACTAR*****/
            case '1':
                if (tipoPersona == '3') {
                    campos_req.push('nombre_empresa_c');
                }
                else {
                    campos_req.push('nombre_c', 'apellido_paterno_c');
                }
                break;
            /********SUB-TIPO CONTACTADO*******/
            case '2':
                if (tipoPersona == '3') {
                    campos_req.push('nombre_empresa_c');
                }
                else {
                    campos_req.push('nombre_c', 'apellido_paterno_c', 'apellido_materno_c');
                }
                break;

            default:
                break;
        }

        if (campos_req.length > 0) {

            for (var i = 0; i < campos_req.length; i++) {

                var temp_req = campos_req[i];

                if (this.model.get(temp_req) == '' || this.model.get(temp_req) == null) {
                    errors[temp_req] = errors[temp_req] || {};
                    errors[temp_req].required = true;
                }
            }
        }

        _.each(errors, function (value, key) {
            _.each(this.model.fields, function (field) {
                if (_.isEqual(field.name, key)) {
                    if (field.vname) {
                        campos = campos + '' + app.lang.get(field.vname, "Leads") + '\n';
                    }
                }
            }, this);
        }, this);

        if (((this.model.get('phone_mobile') == '' || this.model.get('phone_mobile') == null) &&
            (this.model.get('phone_home') == '' || this.model.get('phone_home') == null) &&
            (this.model.get('phone_work') == '' || this.model.get('phone_work') == null)) &&
            this.model.get('subtipo_registro_c') == '2') {

            campos = campos + '' + 'Al menos un Teléfono' + '\n';
            campos = campos.replace("Móvil\n", "");
            campos = campos.replace("Teléfono de casa\n", "");
            campos = campos.replace("Teléfono de Oficina\n", "");

            errors['phone_mobile'] = errors['phone_mobile'] || {};
            errors['phone_mobile'].required = true;
            errors['phone_home'] = errors['phone_home'] || {};
            errors['phone_home'].required = true;
            errors['phone_work'] = errors['phone_work'] || {};
            errors['phone_work'].required = true;
        }
        /*****CHECK LEAD CANCELAR*********/
        if (this.model.get('lead_cancelado_c') == '1') {
            if (this.model.get('motivo_cancelacion_c') == '' || this.model.get('motivo_cancelacion_c') == null) {

                campos = campos + '' + app.lang.get("LBL_MOTIVO_CANCELACION_C", "Leads") + '\n';
                errors['motivo_cancelacion_c'] = errors['motivo_cancelacion_c'] || {};
                errors['motivo_cancelacion_c'].required = true;
            }
        }

        if (campos) {
            app.alert.show("Campos Requeridos", {
                level: "error",
                messages: "Hace falta completar la siguiente información para guardar un <b>Lead: </b><br>" + campos,
                autoClose: false
            });
        }

        callback(null, fields, errors);

        if (campos){
            //Se utiliza dialog ya que al utilizar app.alert.show, como entra en función callback
            //el msj se oculta y no se alcanza a ver el detalle del error
            dialog.showAlert("Hace falta completar la siguiente información para guardar un Lead:\n" + campos);
        }
    }

	duplicateCheckLeads(fields, errors, callback) {
		self=this;
		if(_.isEmpty(errors)){
			//Valida homonimo
			if (this.model.get('subtipo_registro_c')!= '3' && this.model.get('subtipo_registro_c')!= '4') {

				var clean_name_lead = this.model.get('clean_name_c');
				app.alert.show('validando_duplicados', {
					level: 'process',
					messages: 'Cargando...'
				});

				app.api.call("read", app.api.buildURL("Accounts/", null, null, {
					fields: "clean_name",
					max_num: 5,
					"filter": [
					{
						"clean_name": clean_name_lead,
						"id": {
							$not_equals: this.model.id,
						}
					}
					]
				}), null, {
					success: _.bind(function (data) {
						app.alert.dismiss('validando_duplicados');
						if (data.records.length > 0) {
                            //Se establece un campo 'nombre' que no existe para solo llenar el arreglo errors
                            //y evitar que se guarde el registro, sin pintar de color rojo ningún campo (tal y como funciona en web)
							errors['nombre'] = errors['nombre'] || {};
							errors['nombre'].required = true;

							callback(null, fields, errors);
							if(!_.isEmpty(errors)){
								app.alert.show("duplicateCheck_leads_mssg", {
									level: "error",
									messages: "El registro que intentas guardar ya existe como Cuenta",
									autoClose: false
								});
							}

						}else{
							var name_lead_clean = self.model.get('clean_name_c');
							app.alert.show('validando_duplicados', {
								level: 'process',
								messages: 'Cargando...'
							});
							app.api.call("read",app.api.buildURL("Leads/",null,null,{
								fields: "clean_name_c",
								max_num: 5,
								"filter": [{
									"clean_name_c": name_lead_clean,
									"id": {
										$not_equals: self.model.id,
									}
								}
								]

							}),null,{
								success:_.bind(function(data){
									app.alert.dismiss('validando_duplicados');
									if(data.records.length>0){

										errors['nombre'] = errors['nombre'] || {};
										errors['nombre'].required = true;
									}

									callback(null, fields, errors);
									if(!_.isEmpty(errors)){
										app.alert.show("duplicateCheck_leads_mssg_1",{
											level: "error",
											messages: "El registro que intentas guardar ya existe como Lead",
											autoClose: false
										});
									}

								},self)

                    	});//Fin api call
						}

					}, self)
				});
			} else {
				callback(null, fields, errors);
			}
		}else{
			callback(null, fields, errors);
		}
    }

};
customization.register(LeadEditView,{module: 'Leads'});

export default LeadEditView;
