/*Intialize application : pass required parameters*/
App.init();

/*Fetch book list from server*/
App.callAPI('book-list', '?type=json&query=list_books', 
            {
                authCheck: false, 
                successCallback : bookListSuccess,
                errorCallback : bookListFail,
            });

/* On succesfull api call, render book list*/
function bookListSuccess (data) {

    /*Decorator
     * Will store full book details in data attribute of div
     * */
    data.detail = function () {
        return JSON.stringify(this);
    }
    /*Loading trips template and rendering data*/
    var template = $('#bookinfo-template').html();
    /*Loading template and pushing data to it*/
    var rendered = Mustache.to_html(template, data);
    $("#all-books").html(rendered);

    /*Bind actions related to page*/
    bindActions();
    
    /*Setup total Books*/
    App.totalBooks =  window.localStorage['totalBooks'] = data.books.length;
        
    /*Page is rendered now
     * Intialize material design elements
     * */
    $.material.init();
}

/*Function will be called on api call failure*/
function bookListFail (data) {

}

/*Action elements for page*/
function bindActions() {
    
    /*Action on click of details button
     * Get current button id
     * Fetch data from data attribute using id
     * show details on right section of page
     * */
    $('.check-detail').unbind('click').bind('click', function () {
        
        $('.other-details').hide();
        
        var id = $(this).attr('id').split('-')[1];
        $('.thumbnail').removeClass('selected');
        $('#'+id+' .thumbnail').addClass('selected');

        var details = $('#'+id).data('details');
        
        /*Book rating decorator*/
        details.f_rating = function () {

            var ratingText = '';
            for(i = 0; i < parseInt(details.rating) ; i++) {
                ratingText += '<i class="material-icons rating-icon">grade</i>';
            }

            return ratingText;
        }

        var template = $('#bookinfo-details-template').html();
        /*Loading template and pushing data to it*/
        var rendered = Mustache.to_html(template, details);
        $("#book-details").html(rendered);
        
        /*Close button action*/
        $('.detail-close').unbind('click').bind('click', function () {
            $('.other-details').show();
            $('.thumbnail').removeClass('selected');
            $("#book-details").html('');
        });
    });

    /*Search box events*/
    $('input.search-book-input').keypress(function() {
        var that = this;
        setTimeout(function() {
            searchBooks($(this).val())
        }, 10);
    });

    $('input.search-book-input').keyup(function() { searchBooks($(this).val())});
    
    /*Bookmark action setup*/
    $('.bookmark-icon').unbind('click').bind('click', function (){
        if($(this).hasClass('active'))
            App.bookmarked = App.bookmarked - 1;
        else {
            App.bookmarked = App.bookmarked + 1;
            $(this).addClass('active');
        }
        
        window.localStorage['bookmarked'] = App.bookmarked;
    });
}

/*Search implementation on page
 * Show hide book block based on search text
 * */
function searchBooks (value) {
    $(".book-element").each(function () {
        if ($(this).text().search(value) > -1) {
            $(this).show();
        } else {
            $(this).hide();
        }
    });
}