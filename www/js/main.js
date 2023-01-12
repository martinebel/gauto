$(function(){
	'use-strict';

	// body
	$("body").addClass('all-loaded'); 

	// side nav left
	$(".side-nav-left").sideNav({

		edge: 'right',
		closeOnClick: false

	});

	// side nav right
	$(".side-nav-right").sideNav({

		edge: 'left',
		closeOnClick: false

	});

	// menu cart
	$("#cart-menu").animatedModal();
	
	// menu nav
	$("#nav-menu").animatedModal({
		modalTarget: 'animatedModal2'
	});


	// slider
	$(".slider").slider({full_width: true});


	// loader
    $("#fakeLoader").fakeLoader({
      
      zIndex: 999,
      spinner: 'spinner6'

    });

    // collapsible
    $('.collapsible').collapsible({
		accordion: false
	});

    // select
    $('select').material_select();

     
});