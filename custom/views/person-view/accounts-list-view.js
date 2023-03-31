import customization from 'APP/js/core/customization';
import FilteredListView from 'VIEWS/list/filtered-list-view';
import ListView from 'VIEWS/list/list-view';

class AccountsListView extends FilteredListView {
    isFilterEnabled = false;
    isSearchEnabled = true;

    initialize(options) {
        super.initialize(options);
        //Recupera datos del cliente
        var user_id = App.user.id;
        var user_puesto = App.user.attributes.puestousuario_c;
        
        //Solución para filtrar por promotores
        var filtroPromotor = ['5','4','11','10','16','15','3','2','9','8','14','33','6','12','17','53'];
        if (filtroPromotor.indexOf(user_puesto) != -1) {
            this.collection.filterDef = {
                    $or :[
                        {
                            user_id_c: {$in:[user_id]},//leasing
                        },
                        {
                            user_id1_c: {$in:[user_id]},//factoraje
                        },
                        {
                            user_id2_c: {$in:[user_id]},//credito
                        },
                        {
                            user_id6_c: {$in:[user_id]},//fleet
                        },
                        {
                            user_id7_c: {$in:[user_id]},//uniclick
                        }
                    ]
            };
        }
        
    }

    onAfterRender() {
        super.onAfterRender();
    }

    loadData(options){
        super.loadData(options);
    }

};

customization.register(AccountsListView, {module: 'Accounts'});
export default AccountsListView;