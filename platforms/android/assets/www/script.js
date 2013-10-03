var app = {
	events: {
		onDeviceReady: function() {
			// Stub for when DOM is loaded
		},
		onOnline: function() {
			// Stub for when device comes online
		},
		onOffline: function() {
			// Stub for when device goes offline
		}
	},
	dal: {
		open: function() {
			if (!app.dal.db)
                app.dal.db = window.openDatabase(
                    'products.db',
                    '1.0',
                    'products',
                    1000000
                );
		},
		error: function(err) {
			console.log(err.message);
			return null;
		},
		getRows: function(sql, id){
            console.log('in getRows');
			app.dal.db.transaction(
				function(tx){
					tx.executeSql(
						sql,
						[],
						function(tx, results) {
                            console.log('got results');
							app.dal.results = results.rows;
							$(document.body).trigger(id, results.rows);
						},
						app.dal.error
					);
				},
				app.dal.error
			);
		}
	},
	history: [],
    templates: [],
	screens: [
		'montage',
		'cat-intro',
		'select-assess',
		'assess-intro',
		'question-container',
		'product-page'
	],
    assessment: {
        questions: [],
        answers: [],
        question_answered: function() {
            console.log('In question_answered');

            // Determine answer and route user to next screen {question, product}
            var question_id = $(this).data('question-id');
            var answer_id = $(this).data('answer-id');
            var node_type = $(this).data('node-type');
            var node_id = $(this).data('node-id');

            console.log('question_id:'+question_id);
            console.log('answer_id:'+answer_id);

            var question;
            for (var i = 0; i < app.assessment.questions.length; i++) {
                console.log('i:'+i);
                console.log('id:'+app.assessment.questions[i].question_id);

                if (app.assessment.questions[i].question_id == question_id) {
                    console.log('found question');
                    question = app.assessment.questions[i];
                    for (var j = 0; j < question.answers.length; j++) {
                        if (question.answers[j].id == answer_id) {
                            console.log('found answer');
                            question.answer = question.answers[j];
                        }
                    }
                    app.assessment.answers.push(question);
                    app.assessment.questions.splice(i, 1);
                    break;
                }
            }


            app.rndrCont('question-container', null);

            // if type = question, go to next question
            // if type = product, go to product

        },
        getNextQuestion: function() {
            //if (app.assessment.answers == []) {
                return app.assessment.questions[0];
            //}

        }
    },
    cacheQuestions: function(assessment) {
        // TODO: Consider creating a tree instead of an array
        app.assessment.questions = [];
        app.assessment.answers = [];

        var sql = 'select q.question_id, q.question_text, group_concat(a.answer_id) answer_ids, ' +
            'group_concat(a.answer_text) answer_texts, group_concat(a.node_type) node_types, ' +
            'group_concat(a.node_id) node_ids from questions q left join answers a on q.question_id=a.question_id ' +
            'where q.assessment=\''+assessment+'\' group by q.question_id';

        $(document).one('get:content', function (event) {
            try{
                console.log('data:'+event.data.item(0));

                for (var i = 0; i < event.data.length; i++) {
                    var question = {
                        question_id:event.data.item(i).question_id,
                        title:event.data.item(i).title,
                        question:event.data.item(i).question_text,
                        description:'',
                        answers: []
                    };

                    var ans_ids = event.data.item(i).answer_ids.split(',');
                    var texts = event.data.item(i).answer_texts.split(',');
                    var nodes = event.data.item(i).node_types.split(',');
                    var node_ids_tmp = event.data.item(i).node_ids;
                    var node_ids = node_ids_tmp?node_ids_tmp.split(','):null;

                    console.log('ids:'+ans_ids);
                    console.log('texts:'+texts);
                    console.log('nodes:'+nodes);
                    console.log('node_ids:'+node_ids);

                    for (var j = 0; j < ans_ids.length; j++) {
                        console.log('j:'+j);

                        var ans = {
                            id: ans_ids[j],
                            text: texts[j],
                            node_type: nodes[j],
                            // Make sure node_ids AND node_ids[j] are not null before assignment
                            node_id: node_ids?node_ids[j]?node_ids[j]:0:0 // TODO: need to handle node 0?
                        };

                        console.log('answer '+j);
                        console.log(ans)
                        question.answers.push(ans);
                    }

                    console.log('question '+i+':'+question);
                    app.assessment.questions.push(question);
                }
            }
            catch(err){
                console.log(err.message);
            }
        });

        console.log('sql:'+sql);
        app.dal.getRows(sql, 'get:content');
    },
    initialize: function() {
        if (!app.dal.db)
            app.dal.open();

        this.home();
        this.renderTemplates();

        document.addEventListener('deviceready', this.events.onDeviceReady, false);
        document.addEventListener('online', this.events.onOnline, false);
        document.addEventListener('offline', this.events.onOffline, false);
    },
    home: function() {
        app.history = [];
        $('.montage').siblings('.screen').removeClass('current').hide();
        $('.montage').addClass('current').css({left:0}).show();
        $('nav.main-nav').hide();
        $('a.next,.back').one('click',app.onNav);
    },
    onNav: function() {
        // Determine direction of navigation
        var dir, inc;
        if ($(this).hasClass('next')) {
            dir = 'next';
            inc = 1;
        }
        else if($(this).hasClass('back')) {
            dir = 'back';
            inc = -1;
        }
        else {
            return;
        }

        // Determine screen to navigate to
        var curScr = $(this).parents('.screen');
        var curScrNm = curScr.data('screen');

        var nxtScrNm = app.screens[app.screens.indexOf(curScrNm) + inc];
        var nxtScr = $('[data-screen=' + nxtScrNm +']');

        // Get contextual information on the navigation
        var obj = $(this).data('subitem');
        if (!obj) {
            obj = '';
        }
        else {
            obj = obj.toLowerCase().replace(' ','-');
        }

        // Keep track of the navigation history
        if (dir == 'next') {
            var toPush = curScrNm;
            if (obj != '') {
                toPush += ':' + obj;
            }

            app.history.push(toPush);

            // Keep track of the assessment they're using
            if(curScrNm == 'select-assess')
                app.assessment.assessment = obj;
        }
        else {
            app.history.pop();
        }

        // Prepare content and perform transitions
        app.rndrCont(nxtScrNm, obj);
        app.moveScr(curScr, nxtScr, dir);
    },
	rndrCont: function(scr, obj) {
        console.log('in rndrCont;scr:'+scr+';obj:'+obj);

        // Get the questions ready
        if (scr == 'assess-intro')
            app.cacheQuestions(app.assessment.assessment);

        switch (scr) {
            case 'question-container':
				// TODO: Track the questions already answered
                var tmpl = Handlebars.compile($('#question-tmpl').html());

                var qtn_html = tmpl(app.assessment.getNextQuestion());
                $('[data-screen=question-container]').html(qtn_html);
                $('a.back').one('click',app.onNav);
                $('a.answer').one('click', app.assessment.question_answered);
				break;

			case ''://product-page
				var sql = 'select name, desc_1, desc_2, content, image, link from products where product_id=\''+obj+'\'';

				$(document).one('get:content', function (event) {
					var tmpl = Handlebars.compile($('#product_template').html());

					var prod_html = tmpl(eval("(" + event.data.item(0).value + ')'));
					$('[data-screen=product-page]').html(prod_html);
                    $('a.next,.back').one('click',app.onNav);
				});

				app.dal.getRows(sql, 'get:content');

				break;
			default:
                var content = {
                    'cat-intro':'select value from content where screen=\'cat-intro\' and key=\'sound-detection\'',
                    'select-assess':'select value from content where screen=\'select-assess\'',
                    'assess-intro':'select value from content where screen=\'assess-intro\' and key=\''+obj+'\''
                };

                $(document).one('get:content', function (event) {
                    // TODO: figure out a way to cache the templates or precompile them
                    var tmpl =  Handlebars.compile($('#'+scr+'-tmpl').html());
                    // Possible security vulnerability here if someone has write access to DB
                    var html = tmpl(eval("(" + event.data.item(0).value + ')'));
                    $('[data-screen='+scr+']').html(html);
                    $('a.next,.back').one('click',app.onNav);
                });

                console.log('sql:'+content[scr]);
                app.dal.getRows(content[scr], 'get:content');

				break;
		}
	},
	moveScr: function(from, to, direction) {
		var percent = {'next':[-10,0],'back':[100,0]};

		to.show();
		to.addClass('current');
		from.removeClass('current');

		from.animate(
			{left:percent[direction][0]+'%'},
			250,
			'cubic-bezier(0, 0, 0.20, 1)',
			function() {
				from.hide();
			}
		);

		to.animate(
			{left:percent[direction][1]+'%'},
			250,
			'cubic-bezier(0, 0, 0.20, 1)',
			function() {
				to.show();
			}
		);

        $('a.next,.back').one('click',app.onNav);

        if (to.data('screen') != 'montage')
            $('nav.main-nav').show();
        else
            $('nav.main-nav').hide();
	},
    getTemplate: function(name) {
        console.log('in getTemplate;name:'+name);
        console.log('tmpl:'+app.templates[name]);


        if (!app.templates[name])
           app.templates[name] = app.compileTemplate(name);
        return app.templates[name];
    },
	compileTemplate: function(templateId) {
		// Should we precompile the templates so we don't have to do it at runtime?
		return Handlebars.compile($('#' + templateId).html());
	},
	renderTemplate: function() {
		// Stub for rendering data in a template
	},
	renderTemplates: function() {
		// Temporary function to init basic content
/*		if (!qtn_tmpl) {
			var qtn_ctx = {title:'Task Based',
				question:'Do you need data logging capability for later analysis?',
				description:'Choose yes if you want to retrieve, download, share and save instrument data with 3M™ Detection Management Software DMS.',
				answer_1_text:'Yes',answer_2_text:'No'};
			var qtn_tmpl = Handlebars.compile($('#question-tmpl').html());
			var qtn_html = qtn_tmpl(qtn_ctx);

			$('[data-screen=question-container]').html(qtn_html);
		}*/

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

			$('[data-screen=product-page]').html(prod_html);
		}
	}
};

app.dal.open();
app.initialize();

$(function(){
/*	$('a.det-icon, a.pro-icon, a.com-icon').click(function(){
		$('nav.main-nav').show();
	});

	$('a.main-page').click(function(){
		$('nav.main-nav').hide();
	});*/

	//Open Browse functionality
	$('a.open-browse').click(function(){
		var buttonBackground = $(this).parent('li');
		var underSlide = $('.browse').siblings('.current');

		$('.browse .not-montage').hide();
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
		//$('.after-assess').css({left:'100%'});
		//$('.after-assess').removeClass('current');
		$('.cat-intro').css({left:'-10%'});
		$('.select-assess').show();
		$('.cat-intro').hide();
		//$('.after-assess').hide();
		$('cat-intro').removeClass('current');
		$('.select-assess').addClass('current');
		$('.browse').hide();
		$('li.active-nav').removeClass('active-nav');
	});


});
