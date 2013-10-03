var app = {
	events: {
	    onDeviceReady: function() {
	        app.receivedEvent('deviceready');
	    },
	    onOnline: function() {
	    	// Stub for when device comes online
	    },
	    onOffline: function() {
	    	// Stub for when device goes offline
	    }
	},
	screens: [
		'first',
		'category-intro',
		'select-assess',
		'assessment-intro',
		'question-container',
		'product-page'
	],
    initialize: function() {
        this.bindEvents();
    },
    bindEvents: function() {
        document.addEventListener('deviceready', this.events.onDeviceReady, false);
        document.addEventListener('online', this.events.onOnline, false);
        document.addEventListener('offline', this.events.onOffline, false);
    },

    receivedEvent: function(id) {
        console.log('Received Event: ' + id);
    },
    onNext: function() {
    	console.log(this.closest(app.screens));
    }
};


app.initialize();

$(function(){

	$('a.next').click(app.onNext);
	
	
//	Hide all sections besides the first one 
	var otherSlides = $('.first').siblings('.screen');
	$(otherSlides).hide();

    if (!cat_intro_tmpl) {
        // Introduction to Sound Detection, Protection, & Validation
        var cat_intro_ctx = {title:'Sound Detection',header:'Getting Started',
            description:'<p>Complying with regulations, selecting appropriate protection ' +
            'and analyzing noise control options are all easier with 3M ' +
            'detection Solutions instrumentation for exposure assessment, noise ' +
            'analysis and creating a hearing conservation program.</p>' +
            '<p>This guide will help you select the right instrumentation for ' +
            'your assessment needs with confidence. Choose your application to begin.</p>' +
            '<p><strong>Questions? Contact your 3M Detection Solutions ' +
            'representative or 3M Technical Service at 800-245-0779.</strong></p>'};
        var cat_intro_tmpl = Handlebars.compile($('#intro-tmpl').html());
        var cat_intro_html = cat_intro_tmpl(cat_intro_ctx);

        $('.category-intro').html(cat_intro_html);
    }

    if (!cat_ass_tmpl) {
        // Category's assessments
        var cat_ass_ctx = {assessment:'Sound Detection',assessments:[
                {image:'individual.jpg',	title:'Individual'},
                {image:'task-based.jpg',	title:'Task Based'},
                {image:'noise-control.jpg',	title:'Noise Control'},
                {image:'environmental.jpg',	title:'Environmental'},
                {image:'specialty.jpg',		title:'Specialty'}]};
        var cat_ass_tmpl = Handlebars.compile($('#assessment-template').html());
        var cat_ass_html = cat_ass_tmpl(cat_ass_ctx);

        $('.select-assess').append(cat_ass_html);
    }

    if (!ass_intro_tmpl) {
        var ass_intro_ctx = {title:'Task Based',image:'task-based-full.jpg',
            description:'Knowing the noise levels of a particular task or activity is ' +
            'crucial in developing a conservation program that helps protect ' +
            'workers’ hearing. This is achieved through performing an area ' +
            'survey focusing on measurement of the specific task or process.  ' +
            'Find which instrumentation you need to accurately assess your risks.'};
        var ass_intro_tmpl = Handlebars.compile($('#assessment-intro-tmpl').html());
        var ass_intro_html = ass_intro_tmpl(ass_intro_ctx);

        $('.assessment-intro').html(ass_intro_html);
    }

    if (!qtn_tmpl) {
        var qtn_ctx = {title:'Task Based',
            question:'Do you need data logging capability for later analysis?',
            description:'Choose yes if you want to retrieve, download, share and save instrument data with 3M™ Detection Management Software DMS.',
            answer_1_text:'Yes',answer_2_text:'No'};
        var qtn_tmpl = Handlebars.compile($('#question-tmpl').html());
        var qtn_html = qtn_tmpl(qtn_ctx);

        $('.question-container').html(qtn_html);
    }

    if (!prod_tmpl) {
        var prod_ctx = {model:'SD-200',name:'3M™ Sound Detector SD-200',
            subhead:'A value driven sound detection solution.',
            description:'<h3>User friendly</h3><p>Simple four-button navigation to perform all functions and ' +
            'comes ready to take measurements; no configuration necessary.</p><h3>Smart</h3>' +
            '<p>Integrating feature computes the average sound pressure level (LEQ/LAVG), for easier interpretation.</p>' +
            '<h3>Industry compliant</h3><p>Consistent performance with accurate readings and meets ' +
            'applicable ANSI and IEC Class 2 standards.</p>'};
        var prod_tmpl = Handlebars.compile($('#product_template').html());
        var prod_html = prod_tmpl(prod_ctx);

        $('product-page').html(prod_html);
    }





	
$('a.det-icon, a.pro-icon, a.com-icon').click(function(){

			$('nav.main-nav').show();
				
	});
	
	$('a.main-page').click(function(){
		$('nav.main-nav').hide();
	
	});
	

//Enable some links to move the app to the next screen and hide all screens but the current one		
	$('a.next').click(function(){
		var oldSlide = $(this).parents('.screen');
		var newSlide = $(oldSlide).next('.screen');
		$(newSlide).show();
		

		
		
		
		
		$(newSlide).addClass('current');
		$(oldSlide).removeClass('current');
		$(oldSlide).animate({
			left:'-10%'
		}, 250, 'cubic-bezier(0, 0, 0.20, 1)', function() {
			$(oldSlide).hide();
			});
		$(newSlide).animate({
			left:'0%'
		}, 250, 'cubic-bezier(0, 0, 0.20, 1)');

	});

//Enable some links to move the app back one screen and hide all screens but the current one
	$('a.back').click(function(){
		var oldSlide = $(this).parents('.screen');
		var newSlide = $(oldSlide).prev('.screen');
		$(newSlide).show();
		$(newSlide).addClass('current');
		$(oldSlide).removeClass('current');
		$(newSlide).animate({
			left:'0%'
		}, 250, 'cubic-bezier(0, 0, 0.20, 1)');
		$(oldSlide).animate({
		left:'100%'
		}, 250, 'cubic-bezier(0, 0, 0.20, 1)',function() {
			$(oldSlide).hide();
		});
	});




//Open Browse functionality
$('a.open-browse').click(function(){
		var buttonBackground = $(this).parent('li');
		var underSlide = $('.browse').siblings('.current');

		$('.browse .not-first').hide();
		$(buttonBackground).toggleClass('active-nav');
		$('.browse').toggle();
		$('.browse .browse-active').toggle();
		$(underSlide).toggle();		

		
});

//Browse next functionality
$('a.browse-next').click(function(){
			var oldSlide = $(this).parents('.pane');
			var newSlide = $(oldSlide).next('.pane');

			$(newSlide).show();
			$(newSlide).addClass('browse-active');
			$(oldSlide).removeClass('browse-active');
			$(oldSlide).animate({
				left:'-100%'
			}, 250, 'cubic-bezier(0, 0, 0.20, 1)', function() {
				$(oldSlide).hide();
				});
			$(newSlide).animate({
				left:'0%'
			}, 250, 'cubic-bezier(0, 0, 0.20, 1)');
			
});

//Browse back functionality
$('a.back-pane').click(function(){
				var oldSlide = $(this).parents('.pane');
				var newSlide = $(oldSlide).prev('.pane');
				
				$(newSlide).show();
				$(newSlide).addClass('browse-active');
				$(oldSlide).removeClass('browse-active');
				$(newSlide).animate({
					left:'0%'
				}, 250, 'cubic-bezier(0, 0, 0.20, 1)');

				$(oldSlide).animate({
				left:'100%'
				}, 250, 'cubic-bezier(0, 0, 0.20, 1)',function() {
					$(oldSlide).hide();
				});
						
			});

//Open product page
$('a.open-product').click(function(){
			var parentSection = $(this).parents('.screen');
			var productSection = $(parentSection).siblings('.product-page');
			var otherSlides = $(productSection).siblings('.detection');
		
			$(productSection).show();
			$(productSection).addClass('current');
			$(otherSlides).removeClass('current');
			$(otherSlides).hide();
			$(productSection).css({left:0});
			$(parentSection).hide();
			$('.pane').hide();
			$('li.active-nav').removeClass('active-nav');
			
		
		});

//Back up to Select Assessment Page

$('a.open-assessments').click(function(){
			
			$('.select-assess').css({left:0});
			$('.after-assess').css({left:'100%'});
			$('.after-assess').removeClass('current');
			$('.category-intro').css({left:'-10%'});
			$('.select-assess').show();
			$('.category-intro').hide();
			$('.after-assess').hide();
			$('category-intro').removeClass('current');
			$('.select-assess').addClass('current');
			$('.browse').hide();
			$('li.active-nav').removeClass('active-nav');
			


		
	});

$('a.home').click(function(){
			var openSib = $('.opening').siblings('.detection');
			
			$('.opening').css({left:0});
			$('.opening').show();
			$(openSib).css({left:'100%'});
			$(openSib).removeClass('current');
			$(openSib).hide();
			$('.browse').hide();
			$('li.active-nav').removeClass('active-nav');
			$('.main-nav').hide();
			


		
	});

});
