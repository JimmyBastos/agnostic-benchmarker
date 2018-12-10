
const BkTable = {

  name: 'BkTable',

  props: {
    colors: {
      type     : Array,
      required : true
    }
  },

  methods: {
    eventFactory (name, payload) {
      return ($event) => {
        $event.preventDefault()
        this.$emit(name, payload)
      }
    }
  },

  render (h) {
    // style={{ backgroundColor: color }}
    const ColorList = this.colors.map(({ color, color: label, id }) => (
      <tr class='bk-table-row'>
        <td class='bk-table-id'>
          {id}
        </td>

        <td
          class='bk-table-cell'
        >
          <span class='bk-table-label'>
            {label}
          </span>
        </td>

        <td
          class='bk-table-cell'
          style='width: 10ch; text-align: center'>
          {/* icon */}
          <a href='' onClick={this.eventFactory('updateColor', id)} class='button_update pure-button bk-button bk-button-warning'>
            <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 51.4 51.4' width='24' height='24'>
              <g fill='#fff'><path d='M1.7 25.2a1 1 0 0 0 1-1c0-6.065 4.935-11 11-11h24v8.964L51.4 12.2 37.7 2.236V11.2h-24a13.02 13.02 0 0 0-13 13 1 1 0 0 0 1 1zm38-19.036L48 12.2l-8.3 6.036V6.164zm10 20.036a1 1 0 0 0-1 1c0 6.065-4.935 11-11 11h-24v-8.964L0 39.2l13.7 9.964V40.2h24a13.02 13.02 0 0 0 13-13 1 1 0 0 0-1-1zm-38 19.036L3.4 39.2l8.3-6.036v12.072z' /></g>
            </svg>
          </a>
        </td>
        <td
          class='bk-table-cell'
          style='width: 10ch; text-align: center'>
          {/* icon */}
          <a href='' onClick={this.eventFactory('deleteColor', id)} class='button_delete pure-button bk-button bk-button-danger'>
            <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 59 59' width='24' height='24'>
              <g fill='#fff'><path d='M29.5 51a1 1 0 0 0 1-1V17a1 1 0 1 0-2 0v33a1 1 0 0 0 1 1zm-10 0a1 1 0 0 0 1-1V17a1 1 0 1 0-2 0v33a1 1 0 0 0 1 1zm20 0a1 1 0 0 0 1-1V17a1 1 0 1 0-2 0v33a1 1 0 0 0 1 1zm13-45H38.456c-.1-1.25-.495-3.358-1.813-4.7C35.8.434 34.75 0 33.5 0h-10c-1.252 0-2.3.434-3.144 1.3-1.318 1.353-1.703 3.46-1.813 4.7H6.5a1 1 0 1 0 0 2h2.04l1.915 46.02c.037 1.722 1.1 4.98 4.908 4.98h28.272c3.8 0 4.87-3.257 4.907-4.958L50.46 8h2.04a1 1 0 1 0 0-2zM21.792 2.68C22.24 2.223 22.8 2 23.5 2h10c.7 0 1.26.223 1.708.68.805.823 1.128 2.27 1.24 3.32H20.553c.112-1.048.435-2.496 1.24-3.32zm24.752 51.3c-.006.3-.144 3.02-2.908 3.02H15.364c-2.734 0-2.898-2.717-2.9-3.042L10.542 8h37.915l-1.913 45.98z' /></g>
            </svg>
          </a>
        </td>
      </tr>
    ))

    return (
      <table class='bk-table pure-table pure-table-horizontal'>
        {/* TABLE HEAD */}
        {/* <thead class='bk-table-head'>
          <th class='bk-table-head-cell id'>
            #
          </th>
          <th class='bk-table-head-cell'>
            Cor
          </th>
        </thead> */}

        {/* TABLE BODY */}
        <tbody class='bk-table-body'>
          {ColorList}
        </tbody>
      </table>
    )
  }

}

export default BkTable
