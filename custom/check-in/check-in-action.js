import customization from 'APP/js/core/customization';
import dialog from 'APP/js/core/dialog';
import geolocation from 'APP/js/core/geolocation';

// Register custom Check-In action
customization.registerRecordAction({
    
    name: 'checkin',                 // Uniquely identifies the action
    types: ['toolbar'],              // Render action on the toolbar of record detail view
    modules: ['Meetings'],           // Render action for Meetings module only
    label: 'Check-In', // Displayable label. 
    iconKey: 'actions.location',     // Action icon key referenced in SDK's config_template/app.json or custom/app.json
    rank: 0,                         // Action position priority
    
    stateHandlers: {
        isVisible(view, model) {
            var fechaActual = new Date(); //obtiene fecha actual
            var fechainicio = new Date(model.get("date_start"));
            var d = fechainicio.getDate();
            var m = fechainicio.getMonth() + 1;
            var y = fechainicio.getFullYear();
            var fechafin= new Date(y,m-1,d+1, 2,0); //Fecha final

            if (model.get('assigned_user_id')==app.user.attributes.id && (model.get('check_in_time_c')=='' || model.get('check_in_time_c')==null || _.isEmpty(model.get('check_in_time_c')))
            && fechaActual>fechainicio && fechaActual<fechafin && model.get('status')=='Planned'){

                return true;

            }else{
                return false;
            }
        },
    },
    
    // Called when a user clicks the action button
    handler(view, model) {
        
        // Inform user about an operation in progress
        app.alert.show('check_in', {
            level: 'info',
            messages: 'Checking in...',
            autoClose: false,
            closeable: false,
        });
        
        let updateModel = (address) => {
            if(address==undefined){
                model.save();

            }else{

                model.save({
                check_in_address_c: address
            }, {
                // Pass a list of fields to be sent to the server
                fields: [
                    'status',
                    'check_in_latitude_c',
                    'check_in_longitude_c',
                    'check_in_time_c',
                    'check_in_address_c',
                ],
                complete: () => {
                    // Close the alert when save operation completes
                    app.alert.dismiss('check_in');
                }
            });

            }

            
        };
        
        // Called when reverse geocoding completes
        let placemarksObtained = placemarks => {
            let address = placemarks[0];
            if (_.isEmpty(address.formattedAddressLines)) {
                address = [
                    'subThoroughfare',
                    'thoroughfare',
                    'locality',
                    'adminArea',
                    'postalCode',
                    'country',
                ].map(p => address[p]).join(', ').trim();
            }
            else {
                address = (address.formattedAddressLines || []).join(' ').trim();
            }
            app.logger.debug(`Placemark: ${address}`);
            updateModel(address);
        };

        // Called when the current location is obtained
        let locationObtained = position => {
            app.logger.debug(`Latitude: ${position.coords.latitude}, longitude: ${position.coords.longitude}`);
            //Obteniendo producto de usuario logueado
            var productoUser=App.user.get('tipodeproducto_c');

            if(productoUser=='8' ){

                model.set({
                    check_in_time_c: (new Date()).toISOString(),
                    check_in_latitude_c:  position.coords.latitude,
                    check_in_longitude_c: position.coords.longitude,
                    status: "Held"
                });
            }else{
                model.set({
                    check_in_time_c: (new Date()).toISOString(),
                    check_in_latitude_c:  position.coords.latitude,
                    check_in_longitude_c: position.coords.longitude
                });

            }

            //model.save();
            //app.alert.dismiss('check_in');
            
            // Perform reverse geocoding: get physical address from coordinates
            
            geolocation.getGeoPlacemarks({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
            }, {
                successCb: placemarksObtained,
                errorCb: (errCode, errMessage) => {
                    app.logger.debug(`Placemark info is not available: ${errCode} - ${errMessage}`);
                    updateModel('');
                },
            });
            
            
        };

        geolocation.getCurrentPosition({
            enableHighAccuracy: false,
            timeout: 70000,
            successCb: locationObtained,
            errorCb: (errCode, errMessage) => {
                app.logger.debug(`Location is not available: ${errCode} - ${errMessage}`);
                app.alert.dismiss('check_in');
                dialog.showAlert(errMessage);
            },
        });
    },
    
});