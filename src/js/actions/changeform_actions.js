/***********************************************************************
#                                                                       #
# Copyright (C) 2019 Eugen Ciur <eugen@digilette.com>                   #
# All Rights Reserved                                                   #
#                                                                       #
# This is unpublished proprietary source code of Eugen Ciur.            #
#                                                                       #
# You may not copy, modify, sublicense or distribute the Program except #
# if expressly allowed by Eugen Ciur.                                   #
#                                                                       #
# The copyright notice above does not evidence any intended publication #
# of such source code.                                                  #
#                                                                       #
************************************************************************/
import {RenameChangeForm} from "../forms/rename_change_form";
import {find_by_id} from "../utils";
import $ from "jquery";
import {DgSelection} from "../selection";
import {DgClipboard} from "../clipboard";
import {DgNode} from "../node";


export class DgChangeFormAction {
  /*
    An abstraction of action item in (actions) dropdown menu from
    changelist and changeform view.
  */
  constructor(config) {
    this._enabled_cond = config['enabled'];
    // id is a DOM selector (i.e a string)
    this._id = config['id'];
    this._is_enabled = config['initial_state'] || false;
    this._confirm = config['confirm'];
    this._action = config['action'];

    if(this._is_enabled) {
      this.enable();
    }
  }

  get id() {
    return this._id;
  }

  get confirm() {
    return this._confirm;
  }

  get is_enabled() {
    return this._is_enabled;
  }

  enable() {
    this._is_enabled = true;
    $(this._id).removeClass("disabled");
  }

  disable() {
    console.log(`${this._id} disabled`);
    this._is_enabled = false;
    $(this._id).addClass("disabled");
  }

  toggle(selection, clipboard) {
    if (this._enabled_cond(selection, clipboard)) {
      this.enable();
    } else {
      this.disable();
    }
  }

  action(selection, clipboard, current_node) {
    this._action(selection, clipboard, current_node);
  }
}

export class DgChangeFormActions {
  /*
    An abstraction of actions dropdown menu in changelist view.
    Actions dropdown menu operates on a selection of one or many
    items (document or folder).
  */
  constructor(config) {
    let title, id;

    title = $("input[name=document_title]").val();
    id = $("input[name=document_id]").val();

    this._actions = []
    this._selection = new DgSelection();
    // user can cut some items in one folder and
    // paste them in another folder. Cut/Pasted items are placed (taken)
    // to/from DgClipboard
    this._clipboard = new DgClipboard();
    this._current_node = new DgNode(id, title);
    this.configEvents();
  }

  add(action) {
    this._attach_events(action);
    this._actions.push(action)
  }

  _attach_events(action){
      $(action.id).click(
        {
          action: action,
          selection: this._selection,
          clipboard: this._clipboard,
          current_node: this._current_node
        },
        this.on_click
      );
  }

  on_change_selection(selection) {
    /*
      Invoked every time when selection changes i.e. elemnts are either 
      added or removed from the list.

      Theoretically this._selection and selection should be same.
    */
    for (let action of this._actions) {
      action.toggle(this._selection, this._clipboard);
    }
  }

  on_change_clipboard(clipboard) {
    console.log(`on_change_clipboard received ${this._selection}`);

    for (let action of this._actions) {
      action.toggle(this._selection, clipboard);
    }
  }

  on_click(event) {
    let action = event.data.action;
    let selection = event.data.selection;
    let clipboard = event.data.clipboard;
    let current_node = event.data.current_node;

    if (!action.is_enabled) {
      return;
    }

    action.action(
      selection,
      clipboard,
      current_node
    );
  }

  configEvents() {

    this._selection.subscribe_event(
      DgSelection.CHANGE,
      this.on_change_selection,
      this // context
    );

    this._clipboard.subscribe_event(
      DgClipboard.CHANGE,
      this.on_change_clipboard,
      this //context
    );

    for(let action of this._actions) {
        this._attach_events(action);
    }
  }
}



export function build_changeform_actions() {
  /**
  Actions dropdown menu of changeform view.
  */

  if ( !find_by_id("changeform_actions")  ) {
    // there is no point to do anything is actions
    // dropdown is not in the view.
    return;
  }

  let actions = new DgChangeFormActions(),
      rename_action;

  rename_action = new DgChangeFormAction({
    // Achtung! #rename id is same for rename action
    // in changeform view and changelist view.
    id: "#rename",
    enabled: function(selection, clipboard) {
      return true;
    },
    action: function(selection, clipboard, current_node) {
      let rename_form = new RenameChangeForm(current_node);
      rename_form.show();
    }
  });

  actions.add(rename_action);
}
