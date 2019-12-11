function setPaginationClasses(currentPage, numPages) {
  console.log(''+currentPage + ' ' + numPages)
  if (currentPage === 1) { 
    document.querySelector('#firstPage').classList.add('disabled')
  } else if (currentPage === numPages) { 
    document.querySelector('#lastPage').classList.add('disabled')
  } 

  document.querySelector('#page' + currentPage).classList.add('active')

  const MOBILE_SCREEN_WIDTH = 460
  if (window.screen.width < MOBILE_SCREEN_WIDTH) {
    document.querySelector('.pagination').classList.add('pagination-sm')
  }
}