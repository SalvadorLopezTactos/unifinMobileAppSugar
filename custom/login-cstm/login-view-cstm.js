const {Context} = SUGAR.App;
import customization from 'APP/js/core/customization';
import dialog from 'APP/js/core/dialog';
import loginManager from 'APP/js/core/login-manager';
import LoginView from 'VIEWS/login/login-view';
import LoginSettingsView from 'VIEWS/login-settings/login-settings-view';

const mfa_conteo= null;
let contador = 180;
let intervalo = null;


class CustomLoginView extends LoginView {
    template = 'login-cstm';
  
    events(){
      const events = super.events();
       _.extend(events, {

          'click .login__settings_btn': function(...args) {
                    return this.showLoginSettings(...args);
          },
          'keyup input': '_updateBtnsState',
          'focusout input': '_updateBtnsState',
          'change input': '_updateBtnsState',
          'click .continue_btn': 'onSettingsContinue',
          'click .forgotPassword': 'navigateToForgotpassword',
          'change input': '_updateBtnsState',
          'click #login_btn':'pre_login',
					'click #mfa_new':'mfa_new_code',
					'click #mfa_code':'mfa_login',
					//'change #input_code': 'set_code',
       });


       return events;
    }

/*
    events: {
        'click .forgotPassword': 'navigateToForgotpassword',
        'change input': '_updateBtnsState',
        'click #login_btn':'login',
        //'click .login__settings_btn': 'showLoginSettings'
    },
    */

	  initialize(options) {

      super.initialize(options);
    }

    navigateToForgotpassword(e){

    	app.controller.loadScreen({
         isDynamic: true,
         view: ForgotPasswordView,
         data: {
                data:'algo'
            },
          //context: this.context,
        });

    }

    _updateBtnsState() {
        if (this.showLoginSettingsSection) {
            this._updateSettingsBtnsState();
        } else {
            if (app.config.loginSettings.externalLoginVisible) {
                this.$('#external_login_btn').removeAttr('disabled');
            }

            const isLoginDisabled = _.some(['username', 'password'], fieldName =>
                _.isEmpty($(`input[name=${fieldName}]`).val())
            );
            this.$('#login_btn').attr('disabled', isLoginDisabled ? 'disabled' : null);
        }
    }

    login(){
			console.log('before login');
      super.login();
			console.log('after login');
    }
    
    showLoginSettings(options = {}) {
        // update the login settings with username if user entered anything
        if (this.model.get('username')) {
            loginManager.setTempSetting({
                loginName: this.model.get('username'),
            });
        }

        const context = new Context({
            create: true,
        }).prepare();

        const loginSettingsLayout = app.controller._loadScreen({
            isDynamic: true,
            layouts: {
                className: options.firstLaunch ? 'layout__noHeader' : 'layout__loginSettings',
                views: [LoginSettingsView],
                gaTrack: 'login-settings',
                appendTo: 'root',
                context,
                headerConfig: {
                    title: app.lang.get('LBL_LOGIN_SETTINGS_HEADER'),
                    back: true,
                },
            },
        })[0];

        const layoutComponent = loginSettingsLayout.getComponent(LoginSettingsView);

        // eslint-disable-next-line no-shadow
        layoutComponent.once('settings:submit', options => {
            app.controller.disposeDynamic({disposeAll: true});
            this.render();
        });
    }
		
		render(options) {
    	super.render()
			console.log('render');
			/*try {
					self=this;
					this.$('form[name=mfaSection]').hide();
					this.$('form[name=loginSection]').hide();
					this.$('[id=mfa_new_code_button]').hide();
					this.$('[id=login_btn]').hide();
					app.alert.show('validate_login_view', {
							level: 'process',
							title: app.lang.get('LBL_LOADING'),
							autoClose: false
					});
					userData = localStorage['mfaCRM'] == undefined ? 'ND' : localStorage['mfaCRM'];
					app.api.call("read", app.api.buildURL("validateLoginPage/" + userData ), null, {
							success: _.bind(function (validationLoginPage) {
									app.alert.dismiss('validate_login_view');
									// Valida situación: 1- Inicia login  2- Muestra ventana de Código
									if (validationLoginPage.status=='200' && validationLoginPage.situation =='2' && validationLoginPage.valid_secs>0) {
											this.$('form[name=mfaSection]').show();
											this.$('form[name=loginSection]').hide();
											this.$('[id=mfa_code]').show();
											this.$('[id=login_btn]').hide();
											self.mfa_conteo = new Date(validationLoginPage.valid_secs * 1000);
											self.mfa_cuenta();
									}else{
											this.$('form[name=mfaSection]').hide();
											this.$('form[name=loginSection]').show();
											this.$('[id=mfa_code]').hide();
											this.$('[id=login_btn]').show();
											localStorage.removeItem('mfaCRM');
									}
							}, this),
							error: _.bind(function (error) {
								//Muestra error
								app.alert.dismiss('validate_login_view');
								this.$('form[name=mfaSection]').hide();
								this.$('form[name=loginSection]').show();
								this.$('[id=mfa_code]').hide();
								this.$('[id=login_btn]').show();
								localStorage.removeItem('mfaCRM');
							}, this),
					});
				} catch (e) {
					app.alert.dismiss('validate_login_view');
					this.$('form[name=mfaSection]').hide();
					this.$('form[name=loginSection]').show();
					this.$('[id=mfa_code]').hide();
					this.$('[id=login_btn]').show();
					localStorage.removeItem('mfaCRM');
				}
				this.$('form[name=mfaSection]').hide();
				this.$('[name=cstm_mfa_form_button]').hide();
				this.$('[name=mfa_new_code_button]').hide();
				this.$('[id=mfa_code]').hide();
				this.$('[id=login_btn]').show();*/
				
				this.$('form[name=mfaSection]').hide();
				this.$('[id=mfa_code]').hide();
				this.$('[id=mfa_new]').hide();
				
				this.model.attributes['mfa']='';

				//this.$('form[name=login_section]').hide();
    }

		pre_login() {
				console.log('before pre_login');
				//Recupera información de usuario
        this.model.set({
            password: this.$('input[name=password]').val(),
            username: this.$('input[name=username]').val()
        });
        app.alert.dismissAll();
        //Valida usuario
        this.model.doValidate(null,
            _.bind(function(isValid) {
                if (isValid) {
                    //Valida usuario existente
                    try {
                      app.alert.show('validate_login_cstm', {
                          level: 'process',
                          title: app.lang.get('LBL_LOADING'),
                          autoClose: false
                      });

                      localStorage['mfaCRM'] = btoa('{"user":"'+this.model.get('username')+'","password":"'+this.model.get('password')+'"}');
                      var bodyRequest = {
                          userData: localStorage['mfaCRM']
                      }
											let url_path = app.api.buildURL("validateUserLogin");
                      app.api.call("create",url_path, bodyRequest, {
                          success: _.bind(function (validationUsers) {
                              app.alert.dismiss('validate_login_cstm');
                              if (validationUsers.status=='200') {
																	this.$('form[name=login_section]').hide();
																	this.$('[id=login_btn]').hide();
                                  this.$('form[name=mfaSection]').show();
																	this.$('[id=mfa_code]').show();
                                  //this.mfa_conteo = new Date(validationUsers.valid_secs * 1000); //validationLoginPage.valid_sec
                                  //this.mfa_cuenta();
																	contador = validationUsers.valid_secs;
																	intervalo = setInterval(this.actualizarContador, 1000);
                                  app.alert.show('success_validation', {
                                      level: 'info',
                                      messages: validationUsers.message,
                                      autoClose: true
                                  });
                              }else if(validationUsers.status=='201'){
                                  localStorage.removeItem('mfaCRM');
                                  this._super('login');
                              }else{
                                  //Muestra error
                                  localStorage.removeItem('mfaCRM');
                                  app.alert.show('error_login_1', {
                                      level: 'error',
                                      messages: validationUsers.message,
                                      autoClose: false
                                  });
                              }
                          }, this),
                          error: _.bind(function (error) {
                            //Muestra error
                            app.alert.dismiss('validate_login_cstm');
                            localStorage.removeItem('mfaCRM');
                            app.alert.show('error_login_2', {
                                level: 'error',
                                messages: error.errorThrown,
                                autoClose: false
                            });
                            
                          }, this),
                      });
                    } catch (e) {
                      app.alert.dismiss('validate_login_cstm');
                      app.alert.show('error_login_3', {
                          level: 'error',
                          messages: e,
                          autoClose: false
                      });
                    }
                }
            }, this)
        );
    }
    
    mfa_login() {
				console.log('before mfa_login');
        //Logic to validate code. If it's ok call login function
        let mfaCode = this.$('input[name=mfaCode]').val(); //this.model.get('mfa');
        app.alert.dismissAll();
        //Valida código
        if(mfaCode && mfaCode.length==6){
            //Valida código ingresado
            try {
              app.alert.show('validate_code_cstm', {
                  level: 'process',
                  title: app.lang.get('LBL_LOADING'),
                  autoClose: false
              });
              self = this;
              var bodyRequest = {
                userData: localStorage['mfaCRM'],
                code:mfaCode
              }
              app.api.call("create", app.api.buildURL("validateCodeMFA"), bodyRequest, {
                  success: _.bind(function (validationUsers) {
                      app.alert.dismiss('validate_code_cstm');
                      if (validationUsers.status=='200') {
                          this.$('input[name=password]').val(JSON.parse(atob(localStorage['mfaCRM'])).password);
                          this.$('input[name=username]').val(JSON.parse(atob(localStorage['mfaCRM'])).user);
                          localStorage.removeItem('mfaCRM');
                          contador = 0;
                          this._super('login');
                      }else{
                          //Muestra error
                          app.alert.show('error_code_1', {
                              level: 'error',
                              messages: validationUsers.message,
                              autoClose: false
                          });
                      }
                  }, this),
                  error: _.bind(function (error) {
                    //Muestra error
                    app.alert.dismiss('error_code_2');
                    localStorage.removeItem('mfaCRM');
                    self.$('input[name=mfaCode]').val('');
                    app.alert.show('error_login_2', {
                        level: 'error',
                        messages: error.errorThrown,
                        autoClose: false
                    });
                    
                  }, this),
              });
            } catch (e) {
              app.alert.dismiss('validate_code_cstm');
              self.$('input[name=mfaCode]').val('');
              app.alert.show('error_code_3', {
                  level: 'error',
                  messages: e,
                  autoClose: false
              });
            }
            
        }else{
          this.$('input[name=mfaCode]').val('');
          app.alert.show('login_cstm', {
              level: 'error',
              messages: 'Formato no válido, el código debe ser de 6 caracteres. Favor de verificar',
              autoClose: false
          });
        }
    }
  
    mfa_cuenta(){
			console.log('conteo');
      intervaloRegresivo = setInterval(this.mfa_regresiva(), 1000);
    }

   set_code(e){
		 console.log('change');
		 this.model.set('mfa',this.$('input[name=mfaCode]').val());
	 }
    mfa_regresiva(){
      if(this.mfa_conteo.getTime() > 0){
         this.mfa_conteo.setTime(this.mfa_conteo.getTime() - 1000);
         if(this.$('[name=cstm_mfa_form_button]').is(":hidden")){
             this.$('[name=cstm_mfa_form_button]').show();
             this.$('[name=mfa_new_code_button]').hide();
         }
      }else{
         clearInterval(intervaloRegresivo);
         this.$('[name=cstm_mfa_form_button]').hide();
         this.$('[name=mfa_new_code_button]').show();
      }
      document.getElementById('mfa_contador').childNodes[0].nodeValue = (this.mfa_conteo.getMinutes() < 10 ? '0'+this.mfa_conteo.getMinutes() : this.mfa_conteo.getMinutes()) + ":" + (this.mfa_conteo.getSeconds() < 10 ? '0'+this.mfa_conteo.getSeconds() : this.mfa_conteo.getSeconds());
    }
    
    mfa_new_code() {
				console.log('before mfa_new_code');
        //Valida usuario existente
        try {
          app.alert.show('validate_login_cstm', {
              level: 'process',
              title: app.lang.get('LBL_LOADING'),
              autoClose: false
          });

          var bodyRequest = {
            userData: localStorage['mfaCRM']
          }

          app.api.call("create", app.api.buildURL("validateUserLogin"), bodyRequest, {
              success: _.bind(function (validationUsers) {
                  app.alert.dismiss('validate_login_cstm');
                  if (validationUsers.status=='200') {
                      this.$('[id=mfa_new_code_button]').hide();
											this.$('[id=cstm_mfa_form_button]').show();
											// this.$('[name=mfa_new_code_button]').hide();
                      // this.$('[name=cstm_mfa_form_button]').show();
                      // this.mfa_conteo = new Date(validationUsers.valid_secs * 1000); //validationLoginPage.valid_sec
                      // this.mfa_cuenta();
											contador = validationUsers.valid_secs;
											intervalo = setInterval(this.actualizarContador, 1000);
                      app.alert.show('success_validation', {
                          level: 'info',
                          messages: validationUsers.message,
                          autoClose: false
                      });
                  }else{
                      //Muestra error
                      localStorage.removeItem('mfaCRM');
                      app.alert.show('error_login_1', {
                          level: 'error',
                          messages: validationUsers.message,
                          autoClose: false
                      });
                  }
              }, this),
              error: _.bind(function (error) {
                //Muestra error
                app.alert.dismiss('validate_login_cstm');
                localStorage.removeItem('mfaCRM');
                app.alert.show('error_login_2', {
                    level: 'error',
                    messages: validationUsers.message,
                    autoClose: false
                });
                
              }, this),
          });
        } catch (e) {
          app.alert.dismiss('validate_login_cstm');
          app.alert.show('error_login_3', {
              level: 'error',
              messages: e,
              autoClose: false
          });
        }
        
    }
		
		actualizarContador() {
		  let minutos = Math.floor(contador / 60);
		  let segundos = contador % 60;

		  

		  // Detener el contador cuando llegue a cero
		  // if (contador < 0) {
		  //   clearInterval(intervalo);
		  //   alert("¡Tiempo terminado!");
		  // }
			// Actualizar el contador
		 contador--;
		 
		 // Mostrar el tiempo restante en la página web
		 document.getElementById("contador").innerHTML = `${minutos}:${segundos < 10 ? '0' : ''}${segundos}`;
		 
			if(contador > 0){
         if(this.$('[name=cstm_mfa_form_button]').is(":hidden")){
             // this.$('[name=cstm_mfa_form_button]').show();
             // this.$('[name=mfa_new_code_button]').hide();
						 this.$('[id=mfa_code]').show();
						 this.$('[id=mfa_new]').hide();
         }
      }else{
         clearInterval(intervalo);
         // this.$('[name=cstm_mfa_form_button]').hide();
         // this.$('[name=mfa_new_code_button]').show();
				 document.getElementById("contador").innerHTML = '--';
				 this.$('[id=mfa_code]').hide();
				 this.$('[id=mfa_new]').show();
				 
      }
		}

};

export class ForgotPasswordView extends LoginView {
	  template = 'forgotpassword';
    
    events() {
      return {
        'click #return_main_login': 'returnLogin',
        'click #request_new_pwd': 'forgotPassword',
        'change #user_name': 'enableButtonRequest',
        'change #email': 'enableButtonRequest',
      }   
    }

	  initialize(options) {
		  super.initialize(options);
    }

    returnLogin(e){
    	app.controller.goBack();
    }

    onAfterShow(options){
      super.onAfterShow();
      console.log('ONAFTER');
  	}

    enableButtonRequest(){
      $('#email').parents('.field').removeClass('error');
      $('.errorMail').hide();

      var user_name=$('#user_name').val();
      var email=$('#email').val();
      if(user_name != "" && email != ""){

        $('#request_new_pwd').removeAttr('disabled');
        $('#request_new_pwd').attr('style',"");
      }

    }

    forgotPassword(){

      var user_name=$('#user_name').val();
      var email=$('#email').val();

      var exprEmail= /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

      
      if(exprEmail.test(email)==false){
        $('#email').parents('.field').addClass('error');
        $('.errorMail').removeClass('hide');
        $('.errorMail').show();
      }else{
        //Deshabilitando botones hasta que termine proceso de reseteo
        $('#return_main_login').attr('disabled','disabled');
        $('#return_main_login').attr('style','pointer-events:none');

        $('#request_new_pwd').attr('disabled','disabled');
        $('#request_new_pwd').attr('style','pointer-events:none');

        app.alert.show('forgotPassword', {level: 'process', messages: "Cargando, por favor espere un momento", autoClose: false});

                var params = {
                    username: user_name,
                    email:email
                };

                var url = app.api.buildURL('password/request','',{},params);

                app.api.call('READ', url,{},{
                    success: function(response){
                        if(response){

                          dialog.showAlert('Su solicitud ha sido enviada');
                          app.controller.goBack();

                        }
                    },
                    error: function(err){
                        console.log(err.message);
                        dialog.showAlert(err.message);
                        //Resaltando campos erróneos
                        $('#user_name').parents('.field').addClass('error');

                        $('#email').parents('.field').addClass('error');
                        $('.errorMail').removeClass('hide');
                        $('.errorMail').show();

                    },
                    complete: function() {
                        app.alert.dismiss('forgotPassword');
                        
                        //Activando botones nuevamente
                        $('#return_main_login').removeAttr('disabled');
                        $('#return_main_login').attr('style',"");

                        $('#request_new_pwd').removeAttr('disabled');
                        $('#request_new_pwd').attr('style',"");
                    }
                })

      }
      
    }

};

customization.register(CustomLoginView);
export default CustomLoginView;

customization.register(ForgotPasswordView);
//module.exports = ForgotPasswordView;
