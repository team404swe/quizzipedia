import angular from 'angular';
import angularMeteor from 'angular-meteor';
import uiRouter from 'angular-ui-router';
import template from '../templates/quizzipedia.html';
import topbar from '../controllers/topbar';
import navbar from '../controllers/navbar';
import quizList from '../controllers/quizList';
import questionList from '../controllers/questionList';
import quizCreationForm from '../controllers/quizCreationForm';
import questionForm from '../controllers/questionForm';
import searchForm from '../controllers/searchForm';
import quizCompilation from '../controllers/quizCompilation';

class Quizzipedia {
	constructor($scope){
		$scope.viewModel(this);
		
		$(".button-collapse").sideNav();
	}	
}


// create a module
export default angular.module('quizzipedia', [
  angularMeteor,
  uiRouter,
  topbar.name,
  navbar.name,
  quizList.name,
  questionList.name,
  quizCreationForm.name,
  questionForm.name,
  searchForm.name,
  quizCompilation.name
]).component('quizzipedia', {
  templateUrl: 'imports/templates/quizzipedia.html',  
  controllerAs: 'quizzipedia',
  controller: [ '$scope' , Quizzipedia ]
})
	.config(config);
 
	function config($locationProvider, $urlRouterProvider, $stateProvider) {		
	 
		$locationProvider.html5Mode(true);
	 
		$urlRouterProvider.otherwise('/');
	  
		$stateProvider.state('quizlist', {
						url: '/quizlist',
						template: '<quiz-list></quiz-list>'
		});
		$stateProvider.state('questionlist', {
						url: '/questionlist',
						template: '<question-list></question-list>'
		});
		$stateProvider.state('quizCreationForm', {
						url: '/quizCreationForm',
						template: '<quiz-creation-form></quiz-creation-form>'
		});
		$stateProvider.state('questionForm', {
						url: '/questionForm',
						template: '<question-form></question-form>'
		});
		$stateProvider.state('searchForm', {
						url: '/searchForm',
						template: '<search-form></search-form>'
		});
		$stateProvider.state('quizCompilation', {
						url: '/quizCompilation',
						template: '<quiz-Compilation></quiz-Compilation>'
		});
	}
