import React from 'react'
import Types from 'prop-types'

function _prevent ($evt) {
  $evt.preventDefault()
  $evt.stopPropagation()
}

const Template = (props) => {
  const {
    colors,
    handleAdd,
    handleShuffle,
    handleSort,
    handleSwap,
    handleUpdateColor,
    handleDeleteColor,
    handleClear
  } = props

  const TableRows = colors.map(({ id, color: label, color }) => (
    <tr
      key={`table-row-${id}-${color}`}
      style={{ backgroundColor: color }}
      className='app-table-row'
    >
      {/* <!-- COLOR ID --> */}
      <td className='app-table-id'>
        <span
          className='app-table-label'
          style={{ padding: '6px' }}
        >
          {id}
        </span>
      </td>

      {/* <!-- COLOR LABEL --> */}
      <td
        className='app-table-cell'
      >
        <span className='app-table-label'>
          {label}
        </span>
      </td>

      {/* <!-- ACTION: UPDATE COLOR --> */}
      <td className='app-table-cell app-table-action'>

        <a
          href='#update'
          className='button__update pure-button app-button app-table-label'
          onClick={($evt) =>{ handleUpdateColor(id); _prevent($evt) }}
        >
          {/* <!-- button icon --> */}
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 51.4 51.4'
            width='24'
            height='24'
          >
            <g fill='#fff'><path d='M1.7 25.2a1 1 0 0 0 1-1c0-6.065 4.935-11 11-11h24v8.964L51.4 12.2 37.7 2.236V11.2h-24a13.02 13.02 0 0 0-13 13 1 1 0 0 0 1 1zm38-19.036L48 12.2l-8.3 6.036V6.164zm10 20.036a1 1 0 0 0-1 1c0 6.065-4.935 11-11 11h-24v-8.964L0 39.2l13.7 9.964V40.2h24a13.02 13.02 0 0 0 13-13 1 1 0 0 0-1-1zm-38 19.036L3.4 39.2l8.3-6.036v12.072z' /></g>
          </svg>
        </a>
      </td>

      {/* <!-- ACTION: DELETE COLOR --> */}

      <td className='app-table-cell app-table-action'>
        <a
          href='#delete'
          className='button__delete pure-button app-button app-table-label'
          onClick={($evt) => { handleDeleteColor(id); _prevent($evt) }}
        >
          {/* <!-- button icon --> */}
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 59 59'
            width='24'
            height='24'
          >
            <g fill='#fff'><path d='M29.5 51a1 1 0 0 0 1-1V17a1 1 0 1 0-2 0v33a1 1 0 0 0 1 1zm-10 0a1 1 0 0 0 1-1V17a1 1 0 1 0-2 0v33a1 1 0 0 0 1 1zm20 0a1 1 0 0 0 1-1V17a1 1 0 1 0-2 0v33a1 1 0 0 0 1 1zm13-45H38.456c-.1-1.25-.495-3.358-1.813-4.7C35.8.434 34.75 0 33.5 0h-10c-1.252 0-2.3.434-3.144 1.3-1.318 1.353-1.703 3.46-1.813 4.7H6.5a1 1 0 1 0 0 2h2.04l1.915 46.02c.037 1.722 1.1 4.98 4.908 4.98h28.272c3.8 0 4.87-3.257 4.907-4.958L50.46 8h2.04a1 1 0 1 0 0-2zM21.792 2.68C22.24 2.223 22.8 2 23.5 2h10c.7 0 1.26.223 1.708.68.805.823 1.128 2.27 1.24 3.32H20.553c.112-1.048.435-2.496 1.24-3.32zm24.752 51.3c-.006.3-.144 3.02-2.908 3.02H15.364c-2.734 0-2.898-2.717-2.9-3.042L10.542 8h37.915l-1.913 45.98z' /></g>
          </svg>
        </a>
      </td>
    </tr>
  ))

  return (
    <div id='app'>
      <header className='app-header app-u-fixed app-u-pin-t app-u-shadow-lg'>
        {/* <!-- APP MENU --> */}
        <div className='app-container app-menu pure-menu pure-menu-horizontal'>
          {/* <!-- BRAND: framework@version --> */}
          <span className='app-menu-heading pure-menu-heading app-title'>
            React
          </span>
        </div>

        {/* <!-- APP ACTIONS --> */}
        <div className='app-actions'>
          {/* <!-- GRID --> */}
          <div className='app-wrapper app-container'>
            {/* <!-- ADD COLOR --> */}
            <div className='pure-u-12-24 pure-u-md-8-24 pure-u-xl-4-24'>
              <button
                id='button__add'
                className='pure-button app-button'
                style={{ backgroundColor: 'LimeGreen' }}
                onClick={handleAdd}
              >Inserir 1 Item</button>
            </div>

            {/* <!-- LOAD 100 COLORS --> */}
            <div className='pure-u-12-24 pure-u-md-8-24 pure-u-xl-4-24'>
              <button
                id='button__populate'
                className='pure-button app-button'
                style={{ backgroundColor: 'DodgerBlue' }}
                onClick={() => handleAdd(100)}
              >Inserir 100 Itens</button>
            </div>

            {/* <!-- SWAP 2 ROWS --> */}
            <div className='pure-u-12-24 pure-u-md-8-24 pure-u-xl-4-24'>
              <button
                id='button__swap'
                className='pure-button app-button'
                style={{ backgroundColor: 'OrangeRed' }}
                onClick={() => handleSwap([0, colors.length - 1])}
              >Permutar 2 Itens</button>
            </div>

            {/* <!-- SHUFFLE COLORS --> */}
            <div className='pure-u-12-24 pure-u-md-8-24 pure-u-xl-4-24'>
              <button
                id='button__shuffle'
                className='pure-button app-button'
                style={{ backgroundColor: 'DarkViolet' }}
                onClick={handleShuffle}
              >Embaralhar Lista</button>
            </div>

            {/* <!-- SORT COLORS-- > */}
            <div className='pure-u-12-24 pure-u-md-8-24 pure-u-xl-4-24'>
              <button
                id='button__sort'
                className='pure-button app-button'
                style={{ backgroundColor: 'FireBrick' }}
                onClick={handleSort}
              >Ordernar Lista</button>
            </div >

            {/* <!--CLEAR COLORS-- > */}
            <div className='pure-u-12-24 pure-u-md-8-24 pure-u-xl-4-24'>
              <button
                id='button__clear'
                className='pure-button app-button'
                style={{ backgroundColor: 'Crimson' }}
                onClick={handleClear}
              >Limpar Lista</button>
            </div >
          </div >
        </div >
      </header >

      {/* <!--APP TABLE-- > */}
      <div className='app-container app-table-wrapper' >
        <table className='app-table'>
          <tbody className='app-table-body'>

            {/* <!-- COLOR --> */}
            {TableRows}
          </tbody >
        </table >
      </div >
    </div >
  )
}

Template.propTypes = {
  colors            : Types.array.isRequired,
  handleAdd         : Types.func.isRequired,
  handleShuffle     : Types.func.isRequired,
  handleSort        : Types.func.isRequired,
  handleSwap        : Types.func.isRequired,
  handleUpdateColor : Types.func.isRequired,
  handleDeleteColor : Types.func.isRequired,
  handleClear       : Types.func.isRequired
}

export default Template
