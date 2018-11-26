const BkTableRow = {
  name: 'BkTableRow',

  functional: true,

  props: {
    id: {
      type      : [String, Number],
      validator : (val) => !isNaN(val)
    },

    label: {
      type    : String,
      default : ''
    },

    color: {
      type     : String,
      required : true
    }
  },

  render (_, { props }) {
    const { id, label, color } = props

    return (
      <tr class='bk-table-row'>
        <td class='bk-table-id'>
          { id }
        </td>

        <td
          class='bk-table-cell'
          style={{ backgroundColor: color }}
        >
          <span class='bk-table-label'>
            { label }
          </span>
        </td>

        <td
          class='bk-table-cell'
          style='width: 10ch; text-align: center'
        >
          <a href='#' class='bk-table-label'>
            update
          </a>
        </td>
        <td
          class='bk-table-cell'
          style='width: 10ch; text-align: center'
        >
          <a href='#' class='bk-table-label'>
            delete
          </a>
        </td>
      </tr>
    )
  }

}

export default BkTableRow
