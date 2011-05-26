define -> (done)->

  equal @$('.ChildCell.ParentCell > .childOption').html(), "from childOption"
  equal @$('.ChildCell.ParentCell > .renderChild').html(), "from renderChild"
  equal @$('.ChildCell.ParentCell > .parentAfterRender').html(), "from parent afterRender"
  equal @$('.ChildCell.ParentCell > .childAfterRender').html(), "from child afterRender"
  
  done()
