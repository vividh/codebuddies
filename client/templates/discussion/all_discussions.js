Template.allDiscussions.onCreated(function() {
  const title = "CodeBuddies | Discussions";
  const metaInfo = {
    name: "description",
    content: "CodeBuddies is a community of independent code learners who enjoy sharing knowledge and helping each other learn faster. We come from all over the world; there are members living in the United States, Japan, Sweden, the United Kingdom, Russia, Australia, Canada, India, and more. Everyone is welcome, independent of previous knowledge."
  };

  DocHead.setTitle(title);
  DocHead.addMeta(metaInfo);

  let instance = this;
  instance.limit = new ReactiveVar(10);
  instance.flag = new ReactiveVar(false);
  instance.discussionFilter = new ReactiveVar('newest');

  let projection = new Object();
  instance.autorun(function () {
    let limit = instance.limit.get();

    let discussionFilter = instance.discussionFilter.get() || 'newest';
    switch (discussionFilter) {
      case 'newest':
        projection.sort = {'created_at' : -1};
        break;
      case 'oldest':
        projection.sort = {'created_at' : 1};
        break;
      case 'most-commented':
        projection.sort = {'response_count' : -1};
        break;
      case 'least-commented':
        projection.sort = {'response_count' : 1};
        break;
      default:
      projection.sort = {'created_at' : -1};
    }

    instance.subscribe('allDiscussions', limit, discussionFilter);
  });



  console.log(projection);

  instance.loadDiscussions = function() {
    return Discussions.find({},projection);
  }

});

Template.allDiscussions.onRendered(function() {
    let instance = this;

    instance.scrollHandler = function(){

      if  ($(window).scrollTop() > ($(document).height() - $(window).height()) -20 && !instance.flag.get()){

        if(Discussions.find().count() === instance.limit.get()){
             instance.limit.set(instance.limit.get() + 10);
             $('body').addClass('stop-scrolling');
        }else{
           if(Discussions.find().count() < instance.limit.get()){
               instance.flag.set(true);
           }else {

           }
        }

      }

    }.bind(instance);
    $(window).on("scroll" ,instance.scrollHandler);

});

Template.allDiscussions.helpers({
  discussions: function(){
    return Template.instance().loadDiscussions();
  },
  status:function(){
    return  Template.instance().flag.get();
  },
  discussionFilter: function() {
    return Template.instance().discussionFilter.get();
  }
});

Template.allDiscussions.events({
  "click #addDiscussion" (event, template){
     Modal.show("addDiscussionModal", this);
  },
  "click .edit-discussion": function(event) {
    event.preventDefault();
    Modal.show("editDiscussionModal", this);
  },
  "click .delete-discussion": function(event) {
    event.preventDefault();
    const data = {
      id: this._id
    }
    sweetAlert({
        type: 'warning',
        title: "Are you sure ?",
        cancelButtonText: TAPi18n.__("no_delete_hangout"),
        confirmButtonText: TAPi18n.__("yes_delete_hangout"),
        confirmButtonColor: "#d9534f",
        showCancelButton: true,
        closeOnConfirm: false,
      },
      function() {
        // disable confirm button to avoid double (or quick) clicking on confirm event
        swal.disableButtons();

        Meteor.call('discussions.remove', data, function(error, result) {
          if (result) {
            swal("Poof!", "Your Discussion has been successfully deleted!", "success");
          } else {
            swal("Oops something went wrong!", error.error + "\n Try again", "error");
          }
        });

      }); //sweetAlert
  },
  "click .report-discussion": function(event) {
    event.preventDefault();
    // @todo : report it
  },
  "click .upvote": function(event) {
    event.preventDefault();
    const data = {
      id: this._id
    }
    Meteor.call("discussions.upvote", data, function(error, result){
      if(error){
        Bert.alert( error.reason, 'danger', 'growl-top-right' );
      }
      if(result){
        Bert.alert( 'Voted', 'success', 'growl-top-right' );
      }
    });
  },
  "click .downvote": function(event) {
    event.preventDefault();
    const data = {
      id: this._id
    }

    Meteor.call("discussions.downvote", data, function(error, result){
      if(error){
        Bert.alert( error.reason, 'danger', 'growl-top-right' );
      }
      if(result){
        Bert.alert( 'Voted', 'success', 'growl-top-right' );
      }
    });
  },
  "click .newest": function(event, template) {
    event.preventDefault();
    template.discussionFilter.set('newest');
  },
  "click .oldest": function(event, template) {
    event.preventDefault();
    template.discussionFilter.set('oldest');
  },
  "click .most-commented": function(event, template) {
    event.preventDefault();
    template.discussionFilter.set('most-commented');
  },
  "click .least-commented": function(event, template) {
    event.preventDefault();
    template.discussionFilter.set('least-commented');
  },
});

Template.allDiscussions.onDestroyed(function(){
    $(window).off("scroll", this.scrollHandler);
});
