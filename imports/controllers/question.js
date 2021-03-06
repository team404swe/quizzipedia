import angular from 'angular';
import angularMeteor from 'angular-meteor';
import template from '../templates/question.html';

class QuestionController{
	constructor($scope) {
		$scope.viewModel(this);          
	}
}

export default angular.module('question', [
  angularMeteor
])
  .component('question', {
    templateUrl: 'imports/templates/question.html',
    controller: ['$scope', QuestionController]
  });
