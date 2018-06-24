/* eslint-disable no-console */
import {html} from '@polymer/lit-element';
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/paper-card/paper-card';
import '@polymer/paper-button/paper-button';
import './components/mk-stage-list';
import './components/mk-dialog-create-stage';
import './components/mk-dialog-create-task';
import {createStageAction, deleteStageAction, moveStageAction} from '../actions/stage';
import {MkScreen} from './mk-screen';
import {showDialog} from '../actions/app';
import {createTaskAction} from '../actions/task';


export default class MkPhase extends MkScreen {
  constructor() {
    super();
    this.selectedStage = null;
  }

  static get properties() {
    return {
      project: Object,
      phase: Object,
      selectedStage: Object,
    };
  }

  _stateChanged(state) {
    this.project = state.userData.projects[state.route.data.projectId];
    this.phase = this.project ? this.project.phases[state.route.data.phaseId] : null;
  }

  _didRender(props, oldProps, changedProps) {
    this._requireDefaultToolbar();
    this._setDefaultToolbar(html`
      <div main-title>
        <a href="/u/${props.project.id}">${props.project.name}</a>
        <span class="title-seperator"> / </span>
        <a href="/u/${props.project.id}/${props.phase.id}">${props.phase.name}</a>
      </div>
    `);
    this._showToolbar();
  }

  _createStage(stage) {
    stage.projectId = this.project.id;
    stage.phaseId = this.phase.id;
    this._dispatch(createStageAction(stage));
  }

  _moveStage(src, des) {
    const stageId = this.phase.stages[src];
    let stage = this.phase.stageDetails[stageId];
    this._dispatch(moveStageAction(stage, src, des));
  }

  _deleteStage() {
    this._dispatch(deleteStageAction(this.selectedStage));
  }

  _selectStage(stageId) {
    if (stageId) {
      this.selectedStage = this.phase.stageDetails[stageId];
      this._setActionToolbar(html`
        <div main-title>Select an action</div>
        <paper-icon-button icon="edit"></paper-icon-button>
        <paper-icon-button icon="delete" on-click="${() => this._deleteStage()}"></paper-icon-button>
        <paper-icon-button icon="close" on-click="${() => this._deselectStage()}"></paper-icon-button>
      `);
      this._requireActionToolbar();
    } else {
      this._setActionToolbar(null);
      this._requireDefaultToolbar();
    }
  }

  _deselectStage() {
    this.selectedStage = null;
    this.shadowRoot.querySelector('#stageList').deSelectStage();
    this._requireDefaultToolbar();
  }

  _createTask(task, stageId) {
    task.projectId = this.project.id;
    task.phaseId = this.phase.id;
    task.stageId = stageId;
    console.log('_createTask');
    this._dispatch(createTaskAction(task));
  }

  _openCreateStageDialog() {
    let dialog = html`
      <mk-dialog-create-stage
        on-submit="${(e) => this._createStage(e.detail.stage)}"
        on-cancel="${() => console.log('cancelled')}"></mk-dialog-create-stage>`;
    this._dispatch(showDialog(dialog, null));
  }

  _openCreateTaskDialog(stageId) {
    let dialog = html`
      <mk-dialog-create-task
        on-submit="${(e) => this._createTask(e.detail.task, stageId)}"
        on-cancel="${() => console.log('cancelled')}"></mk-dialog-create-task>`;
    this._dispatch(showDialog(dialog, null));
  }

  // noinspection JSMethodCanBeStatic
  _renderStyles() {
    return html`
      <style>
        :host {
          display: block;
          width: 100%;
          height: 100%;
        }
        .content {
          height: 100%;
        }
        .horizontal-list {
          width: auto;
          white-space: nowrap;
          overflow-y: hidden;
          overflow-x: scroll;
        }
        .horizontal-list > .list-item {
          display: inline-block;
          vertical-align: top;
        }
        
        mk-stage-list {
          height: 100%;
          width: auto;
        }
        
        #new-stage {
          display: inline-block;
          vertical-align: top;
          width: 256px;
          margin: 0 16px;
          padding: 8px;
          font-size: 1.2em;
          line-height: 2.5em;
          height: 2.5em;
          text-align: center;
        }
      </style>
    `;
  }

  _render({phase}) {
    let styles = this._renderStyles();
    return html`
      ${styles}
      <div class="content horizontal-list">
        <mk-stage-list 
          id="stageList"
          class="list-item"
          phase="${phase}"
          on-select-stage="${(e) => this._selectStage(e.detail.stageId)}"
          on-move-stage="${(e) => this._moveStage(e.detail.oldIndex, e.detail.newIndex)}"
          on-move-task="${(e) => console.log(e)}"
          on-create-task="${(e) => this._openCreateTaskDialog(e.detail.stageId)}">
        </mk-stage-list>
        <div class="list-item">
          <paper-button id="new-stage" flat on-click="${() => this._openCreateStageDialog()}">New stage</paper-button>
        </div>
      </div>
    `;
  }
}

customElements.define('mk-phase', MkPhase);
