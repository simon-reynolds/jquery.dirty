/// <reference path="../bower_components/jquery/dist/jquery.min.js" />
/// <reference path="../bower_components/qunit/qunit/qunit.js" />
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
  assert.ok(onDirtyCalledCount === 1, "onDirty was not called correctly");

  // Act II
  var $input = $form.find("input:checkbox:first");
  $input.prop("checked", true);
  $input.trigger("change");

  // Assert II
  assert.ok(onDirtyCalledCount === 1, "onDirty should not have been called here");
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
  assert.ok(onDirtyCalledCount === 1, "onDirty was not called correctly");
  // Act II
  var $input = $form.find("input:checkbox:first");
  $input.prop("checked", true);
  $input.trigger("change");

  // Assert II
  assert.ok(onDirtyCalledCount === 2, "onDirty was not called correctly");
});

QUnit.test("form is marked as dirty when setAsDirty called", function(assert){
  // Arrange
  var $form = $("#testForm");
  
  // Act I
  $form.dirty();

  // Assert I
  assert.ok($form.dirty("isClean") === true, "form is clean when plugin initialized");
  assert.ok($form.dirty("isDirty") === false, "form is not dirty when plugin initialized");

  // Act II
  $form.dirty("setAsDirty");
  assert.ok($form.dirty("isClean") === false, "form is now dirty");
  assert.ok($form.dirty("isDirty") === true, "form is now dirty");
});
