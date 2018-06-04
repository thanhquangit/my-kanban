import {html, LitElement} from '@polymer/lit-element';
import {setPassiveTouchGestures} from '@polymer/polymer/lib/utils/settings.js';
import '@polymer/app-layout/app-scroll-effects/effects/waterfall.js';
import '@polymer/app-layout/app-header/app-header.js';
import '@polymer/app-layout/app-drawer/app-drawer.js';
import '@polymer/app-layout/app-drawer-layout/app-drawer-layout.js';
import '@polymer/app-layout/app-header-layout/app-header-layout.js';
import '@polymer/app-layout/app-toolbar/app-toolbar.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-toast/paper-toast.js';
import '@polymer/paper-dialog/paper-dialog.js';


import {connect} from 'pwa-helpers/connect-mixin.js';
import {installRouter} from 'pwa-helpers/router.js';
import {installOfflineWatcher} from 'pwa-helpers/network.js';
import {installMediaQueryWatcher} from 'pwa-helpers/media-query.js';

import {store} from './store.js';
import {Actions} from './actions';
import {APP_INITIAL_STATE} from './initial-state';

import './components/mk-drawer';
import './components/mk-dialog-create-project';
import './screens/mk-home.js';
import './screens/mk-user.js';
import './screens/mk-project.js';

class MyApp extends connect(store)(LitElement) {
  constructor() {
    super();
    setPassiveTouchGestures(true);

    this._ready = false;
    this._globalToast = APP_INITIAL_STATE.globalToast;
    this._globalDialog = APP_INITIAL_STATE.globalDialog;
  }

  static get properties() {
    return {
      _ready: Boolean,
      _page: String,
      _path: Array,
      _user: Object,
      _smallScreen: Boolean,

      _drawer: Object,
      _drawerItems: Array,

      _offline: Boolean,
      _globalToast: Object,
      _globalDialog: Object,
    };
  }

  _stateChanged(state) {
    this._ready = state.app.ready;
    this._page = state.route.page;
    this._path = state.route.path;
    this._user = state.auth.user;
    this._smallScreen = state.app.smallScreen;

    this._drawer = state.app.drawer;

    this._offline = state.app.offline;
    this._globalToast = state.app.globalToast;
    this._globalDialog = state.app.globalDialog;
  }

  _firstRendered() {
    this._drawerItems = [{
      title: 'Dashboard',
      icon: 'icons:dashboard',
      link: 'dashboard',
    }];
    this._drawer = {
      minimized: false,
      opened: true,
    };
    this.smallScreen = false;
    installRouter((location) => store.dispatch(Actions.route.changeRoute(location)));
    installOfflineWatcher((offline) => store.dispatch(Actions.app.setNetworkStatus(offline)));
    installMediaQueryWatcher('(max-width: 767px)', (matches) => this._smallScreen = matches);

    // Custom elements polyfill safe way to indicate an element has been upgraded.
    this.removeAttribute('unresolved');

    this.addEventListener('open-dialog', (config) => {
      this._dialogOpened = true;
      this._dialogContent = config.detail.dialogContent;
    });
  }

  _renderSplashScreen() {
    return html`
            <div style="position:fixed; width: 100vW; height: 100vh; display: flex; justify-content: center; align-items: center;">
                <img src="https://cdn.dribbble.com/users/528264/screenshots/3140440/firebase_logo_1x.png" alt="logo" width="80" height="60"/>
            </div>
        `;
  }

  _renderApp({
               _ready,
               _page,
               _path,
               _user,
               _smallScreen,

               _drawer,
               _drawerItems,

               _offline,
               _globalToast,
               _globalDialog,
             }) {
    const styles = html`
            <!--suppress ALL -->
<style>
              :host {
                display: block;
                position: relative;
                width: 100vw;
                height: 100vh;
                --app-primary-color: #202020;
                --app-secondary-color: #757575;
                --app-accent-color: #172C50;
                --paper-button-ink-color: var(--app-accent-color);
                --paper-icon-button-ink-color: var(--app-accent-color);
                --paper-spinner-color: var(--app-accent-color);
                -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
                color: var(--app-primary-color);
              }
              
              app-drawer-layout {
                --app-drawer-width: 256px;
              }
              
              app-header-layout {
                overflow: hidden;
              }
              
              main {
                width: 100%;
                height: 100vh;
              }
              
              main > * {
                display: none;
              }
        
              main > [active] {
                display: block;
              }
              
              /* small screen */
              @media (max-width: 767px) {
                :host {
                  padding-top: 64px;
                }
              }
                
              #dialog {}
              
              #dialog > * {
                display: none;
              }
        
              #dialog > [active] {
                display: block;
              }
            </style>
        `;

    const miniDrawerStyle = _drawer.minimized ? html`
            <style>
                app-drawer-layout {
                    --app-drawer-width: 56px;
                }
            </style>` : null;

    return html`
            ${styles}
            ${miniDrawerStyle}
            <app-drawer-layout fullbleed narrow="${_smallScreen}">
    
                <!-- Drawer content -->
                <app-drawer id="drawer" slot="drawer" swipe-open="${_smallScreen}" opened="${_drawer.opened}">
                     <mk-drawer 
                        user="${_user}"
                        minimized="${_drawer.minimized}" 
                        drawer-items="${_drawerItems}"
                        on-login="${() => store.dispatch(Actions.auth.login())}"
                        on-logout="${() => store.dispatch(Actions.auth.logout())}"
                        on-toggle-minimize="${(e) => store.dispatch(Actions.app.setAppDrawerMinimization(!e.detail.minimized))}">
                    </mk-drawer>
                </app-drawer>
    
                <!-- Main content -->
                <app-header-layout has-scrolling-region>
                    
                   <main id="pages">
                      <mk-home active?="${_page === 'home'}"></mk-home>
                      <mk-user active?="${_page === 'user'}"></mk-user>
                      <mk-project active?="${_page === 'project'}"></mk-project>
                      <mk-phase active?="${_page === 'phase'}"></mk-phase>
                      <mk-card active?="${_page === 'card'}"></mk-card>
                      <mk-cards active?="${_page === 'cards'}"></mk-cards>
                      <mk-404 active?="${_page === '404'}"></mk-404>
                   </main>
    
                </app-header-layout>
            </app-drawer-layout>     
            
            <paper-dialog id="dialog" opened="${_globalDialog.show}">
                 <mk-dialog-create-project active?="${_globalDialog.content === 'mk-dialog-create-project'}"></mk-dialog-create-project>
            </paper-dialog>  
            
            <paper-toast 
                id="globalToast" 
                opened="${_globalToast.show}" 
                text="${_globalToast.message}" 
                duration="0"
                horizontal-align="right">
            </paper-toast>
            
        `;
  }

  _render(props) {
    return props._ready ? this._renderApp(props) : this._renderSplashScreen();
  }
}

customElements.define('my-app', MyApp);
