define -> (done)->

  equal @$('.ChildCell.ParentCell > .childOption').html(), "from childOption"
  equal @$('.ChildCell.ParentCell > .renderChild').html(), "from renderChild"
  
  done()
