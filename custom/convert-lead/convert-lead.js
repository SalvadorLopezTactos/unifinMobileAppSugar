import customization from 'APP/js/core/customization';
import dialog from 'APP/js/core/dialog';

// Register custom Check-In action
customization.registerRecordAction({
    
    name: 'convert-lead',                 // Uniquely identifies the action
    types: ['right-menu-detail'],              // Render action on the toolbar of record detail view
    modules: ['Leads'],           // Render action for Meetings module only
    label: 'Convertir Lead',// Displayable label. 
    iconKey: 'sorting.myItemsOnly',     // Action icon key referenced in SDK's config_template/app.json or custom/app.json
    rank: 1,                         // Action position priority
    
    stateHandlers: {
        isVisible(view, model) {
            var bandera;
            if(model.get('subtipo_registro_c')!='4'){//Convertido
                bandera=true;
            }else{
                bandera=false;
            }
            return bandera;
        },
    },
    
    // Called when a user clicks the action button
    handler(view, model) {
            
        this.convert_Lead_to_Accounts(model);
    },

    convert_Lead_to_Accounts: function (model) {
        self = this;
        var filter_arguments = {
            "id": model.get('id')
        };
        // alert(model.get('id'))
        this.valida_requeridos(model);

        app.alert.show('upload', {
                level: 'load',
                closeable: false,
                messages: app.lang.get('LBL_LOADING'),
            });

            app.api.call("create", app.api.buildURL("existsLeadAccounts", null, null, filter_arguments), null, {
                success: _.bind(function (data) {

                    console.log(data);
                    app.alert.dismiss('upload');
                    app.controller.context.reloadData({});

                    if (data.idCuenta === "") {
                        app.alert.show("Conversión", {
                            level: "error",
                            messages: data.mensaje,
                            autoClose: false
                        });
                    } else {
                        app.alert.show("Conversión", {
                            level: "success",
                            messages: data.mensaje,
                            autoClose: false
                        });
                        //this._disableActionsSubpanel();

                    }

                    /*
                    var btnConvert = this.getField("convert_Leads_button")

                    if (model.get('subtipo_registro_c') == '2') {
                        btnConvert.show();
                    } else {
                        btnConvert.hide();
                    }
                    */
                    

                }, this),
                failure: _.bind(function (data) {
                    app.alert.dismiss('upload');

                }, this),
                error: _.bind(function (data) {
                    app.alert.dismiss('upload');

                }, this)
            });

    },

    valida_requeridos: function (model) {
        var campos = "";
        var subTipoLead = model.get('subtipo_registro_c');
        var tipoPersona = model.get('regimen_fiscal_c');
        var campos_req = ['origen_c'];
        var response = false;
        var errors = {};

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
                    campos_req.push('nombre_c', 'apellido_paterno_c', 'puesto_c');
                }

                campos_req.push('macrosector_c', 'ventas_anuales_c', 'zona_geografica_c', 'email');

                break;

            default:
                break;
        }

        if (campos_req.length > 0) {

            for (var i = 0; i < campos_req.length; i++) {

                var temp_req = campos_req[i];

                if (temp_req == 'ventas_anuales_c') {
                    if (model.get('ventas_anuales_c') == 0) {
                        errors[temp_req] = errors[temp_req] || {};
                        errors[temp_req].required = true;

                    }
                }

                else if (model.get(temp_req) == '' || model.get(temp_req) == null) {
                    errors[temp_req] = errors[temp_req] || {};
                    errors[temp_req].required = true;
                }
            }
        }

        _.each(errors, function (value, key) {
            _.each(model.fields, function (field) {
                if (_.isEqual(field.name, key)) {
                    if (field.vname) {
                        campos = campos + '<b>' + app.lang.get(field.vname, "Leads") + '</b><br>';
                    }
                }
            }, this);
        }, this);

        if (((model.get('phone_mobile') == '' || model.get('phone_mobile') == null) &&
            (model.get('phone_home') == '' || model.get('phone_home') == null) &&
            (model.get('phone_work') == '' || model.get('phone_work') == null)) &&
            model.get('subtipo_registro_c') == '2') {

            campos = campos + '<b>' + 'Al menos un Teléfono' + '</b><br>';
            campos = campos.replace("<b>Móvil</b><br>", "");
            campos = campos.replace("<b>Teléfono de casa</b><br>", "");
            campos = campos.replace("<b>Teléfono de Oficina</b><br>", "");

            errors['phone_mobile'] = errors['phone_mobile'] || {};
            errors['phone_mobile'].required = true;
            errors['phone_home'] = errors['phone_home'] || {};
            errors['phone_home'].required = true;
            errors['phone_work'] = errors['phone_work'] || {};
            errors['phone_work'].required = true;
        }

        /*if (campos) {
            app.alert.show("Campos Requeridos", {
                level: "error",
                messages: "Hace falta completar la siguiente información para convertir un <b>Lead: </b><br>" + campos,
                autoClose: false
            });
        }*/

        // console.log("campos requeridos "  +campos);

        if (campos == "") {
            response = true;
        }

        return response;
    }
    
});