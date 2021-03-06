export class CutForm {

    constructor(items, parent_id, id="#cut_form") {
        this._items = items;
        this._id = id;
        this._parent_id = parent_id;
        // will create hidden inputs node ids
        this._create_hidden_inputs(items);
    }

    _create_hidden_inputs(items) {
        items.forEach((item) => {
            let hidden_input = `<input \
             type="hidden" \
             name="node_ids[]" \
             value="${item.id}" \
             />`

            $(this._id).append(hidden_input);
        });
    }

    submit() {
        let url = $(this._id).attr('action'),
            params = $(this._id).serialize();

        $.post(
            url,
            params
        );
    }
}
