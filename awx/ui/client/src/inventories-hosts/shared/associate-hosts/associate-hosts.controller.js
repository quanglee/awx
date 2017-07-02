/*************************************************
 * Copyright (c) 2017 Ansible, Inc.
 *
 * All Rights Reserved
 *************************************************/

 export default ['$scope', '$rootScope', 'ProcessErrors', 'GetBasePath', 'generateList',
 '$state', 'Rest', '$q', 'Wait', '$window', 'QuerySet', 'HostsList',
 function($scope, $rootScope, ProcessErrors, GetBasePath, generateList,
     $state, Rest, $q, Wait, $window, qs, HostsList) {
     $scope.$on("linkLists", function() {

         init();

         function init(){
             $scope.associate_host_default_params = {
                 order_by: 'name',
                 page_size: 5
             };

             $scope.associate_host_queryset = {
                 order_by: 'name',
                 page_size: 5
             };

             let list = _.cloneDeep(HostsList);
             list.basePath = GetBasePath('inventory') + $state.params.inventory_id + '/hosts';
             list.iterator = 'associate_host';
             list.name = 'associate_hosts';
             list.multiSelect = true;
             list.fields.name.ngClick = 'linkoutHost(associate_host.id)';
             list.trackBy = 'associate_host.id';
             delete list.fields.toggleHost;
             delete list.fields.active_failures;
             delete list.fields.inventory;
             delete list.actions;
             delete list.fieldActions;
             list.well = false;
             $scope.list = list;

             // Fire off the initial search
             qs.search(list.basePath, $scope.associate_host_default_params)
                 .then(function(res) {
                     $scope.associate_host_dataset = res.data;
                     $scope.associate_hosts = $scope.associate_host_dataset.results;

                     let html = generateList.build({
                         list: list,
                         mode: 'edit',
                         title: false,
                         hideViewPerPage: true
                     });

                     $scope.compileList(html);

                     $scope.$watchCollection('associate_hosts', function () {
                         if($scope.selectedItems) {
                             $scope.associate_hosts.forEach(function(row, i) {
                                 if (_.includes($scope.selectedItems, row.id)) {
                                     $scope.associate_hosts[i].isSelected = true;
                                 }
                             });
                         }
                     });

                 });

             $scope.selectedItems = [];
             $scope.$on('selectedOrDeselected', function(e, value) {
                 let item = value.value;

                 if (value.isSelected) {
                     $scope.selectedItems.push(item.id);
                 }
                 else {
                     // _.remove() Returns the new array of removed elements.
                     // This will pull all the values out of the array that don't
                     // match the deselected item effectively removing it
                     $scope.selectedItems = _.remove($scope.selectedItems, function(selectedItem) {
                         return selectedItem !== item.id;
                     });
                 }
             });
         }

         $scope.linkhosts = function() {
             $scope.saveFunction({selectedItems: $scope.selectedItems})
                 .then(() =>{
                     $scope.closeModal();
                 }).catch((error) => {
                     $scope.closeModal();
                     ProcessErrors(null, error.data, error.status, null, {
                         hdr: 'Error!',
                         msg: 'Failed to associate host to host(s): POST returned status' +
                             error.status
                     });
                 });

         };

         $scope.linkoutHost = function(userId) {
             // Open the edit user form in a new tab so as not to navigate the user
             // away from the modal
             $window.open('/#/users/' + userId,'_blank');
         };
     });
 }];