jQuery(document).ready(function() {
  const more = "Voir l'article";
  const write_by = "Écrit par";
  const publihed = "le";
  let url_send;

  function run_media(url_send,post_id,id_media) {
    $.ajax({
      url: url_send+'/wp-json/wp/v2/media/'+id_media,
      success: function (response) {
        var url_img = response.media_details.sizes.medium.source_url;
        $('#'+post_id+'.data_item .featured_media').css('background-image','url('+url_img+')');
      },
      error: function (error) {
        console.log(error);
      }
    });
  }

  function run_terms(url_send,post_id,url_post_categories,type="categories") {
    for (i in url_post_categories) {
      $.ajax({
        url: url_send+'/wp-json/wp/v2/'+type+'/'+url_post_categories[i],
        success: function (response) {
          $('#'+post_id+'.data_item .data_item_content').append($('<span class="terms terms_'+type+'" data-slug='+response.slug+'>'+response.name+'</span>'));
        },
        error: function (error) {
          console.log(error);
        }
      });
    }
  }

  function run_author(post_id,url_author) {
    $.ajax({
      url: url_author,
      success: function (response) {
        $('#'+post_id+'.data_item .author').text(write_by+' '+response.name+' ');
      },
      error: function (error) {
        return 'Anonymous';
      }
    });
  }

  function run_date(date) {
    var dat_set = new Date(date);
    return(((dat_set.getDate() > 9) ? dat_set.getDate() : ('0' + dat_set.getDate())) + '/' +((dat_set.getMonth() > 8) ? (dat_set.getMonth() + 1) : ('0' + (dat_set.getMonth() + 1))) + '/' + dat_set.getFullYear());
  }

  function is_wp(url_send,data,type='archives') {
    if(type === 'archives') {
      $.each(data, function(i,val) {
        var post = data[i];
        $('.js_data').append('<a id="'+post.id+'" class="data_item"></a>');
        $('#'+post.id+'.data_item').attr('href',post.link).attr('target','_blank');

        /* media */
        if(post.featured_media) {
          $('#'+post.id+'.data_item').append('<div class="featured_media"></div>');
          run_media(url_send,post.id,post.featured_media);
        }

        $('#'+post.id+'.data_item').append($('<div class="data_item_content"></div>'));

        /* title */
        $('#'+post.id+'.data_item .data_item_content').append($('<h3 class="title"></h3>').html(post.title.rendered));

        $('#'+post.id+'.data_item .data_item_content').append($('<div class="data_item_metadata"></div>'));

        /* author */
        $('#'+post.id+'.data_item .data_item_content .data_item_metadata').append($('<span class="author"></span>'));
        run_author(post.id,post._links.author[0].href);

        /* date */
        $('#'+post.id+'.data_item .data_item_content .data_item_metadata').append($('<span class="date"></span>').html(publihed + ' '+run_date(post.date)));

        /* content */
          var final_content = post.excerpt.rendered.substr(0, 240);

        $('.sharedaddy').hide().remove();
        $('#'+post.id+'.data_item .data_item_content').append($('<div class="content"></div>').html(final_content));

        /* categories */
        if(post.categories) {
          run_terms(url_send,post.id,post.categories);
        }

        /* tags */
        if(post.tags) {
          run_terms(url_send,post.id,post.tags,"tags");
        }

        /* comment status */
        if(post.comment_status === true)
          $('#'+post.id+'.data_item .data_item_contentt').append($('<i class="fas fa-comment"></i>'));
        else
          $('#'+post.id+'.data_item .data_item_contentt').append($('<i class="fas fa-comment-slash"></i>'));
      });
    }
  }

  function run_connexion(url_send) {
    $.ajax({
      url: url_send+'/wp-json/wp/v2/posts?_fields=id,link,content,featured_media,title,_links,date,excerpt,categories,tags,comment_status&per_page=12',
      success: function (response) {
        $('.js_data').html('');
        is_wp(url_send,response);
        $('.js_url_success').show();
        $('html,body').animate({
          scrollTop:$('.js_url_success').offset().top
        }, 'slow');
      },
      error: function (error) {
        $('.js_api_error').show();
      }
    });
  }

  function url_match(url_send) {
    var expression = /https:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([A-Z0-9]*)?/gi;
    var regex = new RegExp(expression);
    if (url_send.match(regex)) {
      $('.message').hide();
      run_connexion(url_send);
    }
    else {
      $('.js_url_error').show();
    }
  }

  $('body .js_submit').on('click',function(e) {
    e.preventDefault();
    url_send = $('.js_is_wp_url').val();
    url_match(url_send);
  });

  $('body .js_test').on('click',function(e) {
    e.preventDefault();
    url_send = $(this).text();
    url_match(url_send);
  });
});