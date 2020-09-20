/// <reference path="../node_modules/jquery/dist/jquery.min.js" />
/// <reference path="../node_modules/qunitjs/qunit/qunit.js" />
/// <reference path="../dist/jquery.dirty.js" />

QUnit.module("jquery.dirty", {
    beforeEach: function () {
        // add form to page from template
        var form = $("#formTemplate").html();
        $("#qunit-fixture").html(form);
    },
    afterEach: function () {
        // clear form
        $("#qunit-fixture").html("");
    }
});

QUnit.test("jQuery.dirty is referenced", function(assert) {
  assert.ok($.fn.dirty !== undefined, "jQuery.dirty is defined");
  assert.ok(typeof($.fn.dirty) === "function", "jQuery.dirty is a function"); 
});

QUnit.test("default values exist", function(assert){

  assert.ok($.fn.dirty.defaults !== undefined, "default values are defined");
  assert.ok($.fn.dirty.defaults.preventLeaving !== undefined, "default preaventLeaving is defined");
  assert.ok($.fn.dirty.defaults.leavingMessage !== undefined, "default leavingMessage is defined");
  assert.ok($.fn.dirty.defaults.onDirty !== undefined, "default onDirty is defined");
  assert.ok($.fn.dirty.defaults.onClean !== undefined, "default onClean is defined");
  assert.ok($.fn.dirty.defaults.fireEventsOnEachChange !== undefined, "default fireEventsOnEachChange is defined");

});

QUnit.test("default values are as expected", function(assert){

  assert.ok($.fn.dirty.defaults.preventLeaving === false, "default preaventLeaving value is as expected");
  assert.ok(typeof($.fn.dirty.defaults.leavingMessage === "object"), "default leavingMessage value is as expected");
  assert.ok(typeof($.fn.dirty.defaults.onDirty === "function"), "default onDirty value is as expected");
  assert.ok(typeof($.fn.dirty.defaults.onClean === "function"), "default onClean value is as expected");
  assert.ok($.fn.dirty.defaults.fireEventsOnEachChange === false, "default fireEventsOnEachChange is defined");

});

QUnit.test("form is marked as clean when plugin initialized", function(assert){
  // Arrange
  var $form = $("#testForm");
  
  // Act
  $form.dirty();

  // Assert
  assert.ok($form.dirty("isClean") === true, "form is clean when plugin initialized");
  assert.ok($form.dirty("isDirty") === false, "form is not dirty when plugin initialized");
});

QUnit.test("form is marked as dirty when modified", function(assert){
  // Arrange
  var $form = $("#testForm");
  $form.dirty();
  
  // Act
  var $input = $form.find("input:first");
  $input.val("test");
  $input.trigger("change");

  // Assert
  assert.ok($form.dirty("isClean") === false, "form is not clean when form modified");
  assert.ok($form.dirty("isDirty") === true, "form is dirty when form modified");
});

QUnit.test("form is marked as clean when setAsClean is called", function(assert){
  // Arrange
  var $form = $("#testForm");
  var onDirtyCalledCount = 0;
  var onCleanCalledCount = 0;
  var options = {
    onDirty: function(){
      onDirtyCalledCount++;
    },
    onClean: function(){
      onCleanCalledCount++;
    },
    fireEventsOnEachChange: false
  };
  $form.dirty(options);
  
  // Act I
  var $input = $form.find("input:first");
  $input.val("test");
  $input.trigger("change");

  // Assert I
  assert.ok($form.dirty("isClean") === false, "form is not clean when form modified");
  assert.ok($form.dirty("isDirty") === true, "form is dirty when form modified");
  assert.ok(onDirtyCalledCount === 1, "onDirty called");
  assert.ok(onCleanCalledCount === 0, "onClean was not called");

  // Act II
  $form.dirty("setAsClean");

  // Assert II
  assert.ok($form.dirty("isClean") === true, "form is clean when setAsClean called");
  assert.ok($form.dirty("isDirty") === false, "form is not dirty when setAsClean called");
  assert.ok(onDirtyCalledCount === 1, "onDirty was not called");
  assert.ok(onCleanCalledCount === 1, "onClean was called");
});

QUnit.test("form is marked as clean when changes are reverted", function(assert){
  // Arrange
  var $form = $("#testForm");
  var onCleanCalledCount = 0;
  var options = {
    onClean: function(){
      onCleanCalledCount++;
    },
    fireEventsOnEachChange: false
  };
  $form.dirty(options);

  // dirty the form
  var $input = $form.find("input:first");
  $input.val("test");
  $input.trigger("change");

  // Act I
  $input.val("");
  $input.trigger("change");

  // Assert
  assert.ok($form.dirty("isClean") === true, "form is clean when resetForm called");
  assert.ok($form.dirty("isDirty") === false, "form is not dirty when resetForm called");
  assert.ok(onCleanCalledCount === 1, "onClean was called");
});

QUnit.test("form is marked as clean when resetForm is called", function(assert){
  // Arrange
  var $form = $("#testForm");
  var onCleanCalledCount = 0;
  var options = {
    onClean: function(){
      onCleanCalledCount++;
    },
    fireEventsOnEachChange: false
  };
  $form.dirty(options);

  // dirty the form
  var $input = $form.find("input:first");
  $input.val("test");
  $input.trigger("change");
  
  // Act I
  $form.dirty("resetForm");

  // Assert
  assert.ok($form.dirty("isClean") === true, "form is clean when resetForm called");
  assert.ok($form.dirty("isDirty") === false, "form is not dirty when resetForm called");
  assert.ok(onCleanCalledCount === 1, "onClean was called");
});

QUnit.test("form is marked as dirty when a radio button is selected", function(assert){
  // Arrange
  var $form = $("#testForm");
  $form.dirty();
  
  // Act
  var $input = $form.find("input:radio:first");
  $input.prop("checked", true);
  $input.trigger("change");

  // Assert
  assert.ok($form.dirty("isClean") === false, "form is not clean when form modified");
  assert.ok($form.dirty("isDirty") === true, "form is dirty when form modified");
});

QUnit.test("form is marked as dirty when a checkbox button is selected", function(assert){
  // Arrange
  var $form = $("#testForm");
  $form.dirty();
  
  // Act
  var $input = $form.find("input:checkbox:first");
  $input.prop("checked", true);
  $input.trigger("change");

  // Assert
  assert.ok($form.dirty("isClean") === false, "form is not clean when form modified");
  assert.ok($form.dirty("isDirty") === true, "form is dirty when form modified");
});

QUnit.test("showDirtyFields returns correct fields", function(assert){
  // Arrange
  var $form = $("#testForm");
  $form.dirty();
  
  // Act I
  var $text = $form.find("input:text:first");
  $text.val("test").trigger("change");

  // Assert I
  var listDirtyFields = $form.dirty("showDirtyFields");
  assert.ok(listDirtyFields.length === 1, "Should only be listig one dirty field");

  // Act II
  var $input = $form.find("input:checkbox:first");
  $input.prop("checked", true);
  $input.trigger("change");

  // Assert II
  listDirtyFields = $form.dirty("showDirtyFields");
  assert.ok(listDirtyFields.length === 2, "Should only be listing two dirty fields");

});


QUnit.test("onDirty only fired once when fireEventsOnEachChange is false", function(assert){
  // Arrange
  var $form = $("#testForm");
  var onDirtyCalledCount = 0;
  var options = {
    onDirty: function(){
      onDirtyCalledCount++;
    },
    fireEventsOnEachChange: false
  };
  $form.dirty(options);
  
  // Act I
  var $text = $form.find("input:text:first");
  $text.val("test").trigger("change");

  // Assert I
  assert.ok(onDirtyCalledCount === 1, "onDirty was not called correctly. Value should be 1, was " + onDirtyCalledCount);

  // Act II
  var $input = $form.find("input:checkbox:first");
  $input.prop("checked", true);
  $input.trigger("change");

  // Assert II
  assert.ok(onDirtyCalledCount === 1, "onDirty should not have been called here. Value should be 1, was " + onDirtyCalledCount);
});

QUnit.test("onDirty fired each time when fireEventsOnEachChange is true", function(assert){
  // Arrange
  var $form = $("#testForm");
  var onDirtyCalledCount = 0;
  var options = {
    onDirty: function(){
      onDirtyCalledCount++;
    },
    fireEventsOnEachChange: true
  };

  $form.dirty(options);  
  
  // Act I
  var $text = $form.find("input:text:first");
  $text.val("test").trigger("change");
  // Assert I
  assert.ok(onDirtyCalledCount === 1, "onDirty was not called correctly. Value should be 1, was " + onDirtyCalledCount);
  // Act II
  var $input = $form.find("input:checkbox:first");
  $input.prop("checked", true);
  $input.trigger("change");

  // Assert II
  assert.ok(onDirtyCalledCount === 2, "onDirty was not called correctly. Value should be 2, was " + onDirtyCalledCount);
});

QUnit.test("form is marked as dirty when setAsDirty called", function(assert){
  // Arrange
  var $form = $("#testForm");

  var onDirtyCalledCount = 0;
  var options = {
    onDirty: function(){
      onDirtyCalledCount++;
    },
    fireEventsOnEachChange: true
  };
  
  // Act I
  $form.dirty(options);

  // Assert I
  assert.ok($form.dirty("isClean") === true, "form is clean when plugin initialized");
  assert.ok($form.dirty("isDirty") === false, "form is not dirty when plugin initialized");

  // Act II
  $form.dirty("setAsDirty");
  assert.ok($form.dirty("isClean") === false, "form is now dirty");
  assert.ok($form.dirty("isDirty") === true, "form is now dirty");

  assert.ok(onDirtyCalledCount === 1, "onDirty was called");
});

// QUnit.test("form marked dirty when file added", function(assert){
//   // Arrange
//   var $form = $("#testForm");

//   var testFileInfo = {

//   }
    
//   // Act I
//   $form.dirty();

//   // Assert I
//   assert.ok($form.dirty("isClean") === true, "form is clean when plugin initialized");
//   assert.ok($form.dirty("isDirty") === false, "form is not dirty when plugin initialized");

//   var fileInput = $form.find("input:file:first")[0];
//   assert.ok(fileInput.files instanceof FileList, "This should be a file input")
//   assert.ok(fileInput.files.length ===  0, "FileList should be empty")

//   // Act II
//   // TODO - stub file addition and test that form is now dirty
  
// });
