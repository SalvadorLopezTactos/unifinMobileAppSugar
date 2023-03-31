import customization from 'APP/js/core/customization';
import TextField from 'FIELDS/text-field.js';

class CanalUniclickField extends TextField {

    initialize(options) {

        super.initialize(options);
        this.getListValuesCanal();

    }

    getListValuesCanal(){
        window.canal_uniclick="";
        var selfList=this;
        app.alert.show('getlistaCanal', {
                level: 'load',
                closeable: false,
                messages: app.lang.get('LBL_LOADING'),
            });
        app.api.call('GET', app.api.buildURL('GetDropdownList/canal_list'), null, {
                success: _.bind(function (data) {
                    if (data) {
                        delete data[""];
                        selfList.lista_canal=data;  
                    }
                    app.alert.dismiss('getlistaCanal');
                    selfList.render();
                    if(window.canal_uniclick != undefined){
                        $(".canalUniclick").val(window.canal_uniclick);
                    }
                    
                }, selfList),
            });

    }
   
};

customization.register(CanalUniclickField, { metadataType: 'canal_uniclick_mobile' });
export default CanalUniclickField;