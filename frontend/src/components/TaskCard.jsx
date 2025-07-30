import {React,useState} from 'react'
import DeleteIcon from '@mui/icons-material/Delete';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import "./componentscss/TaskCard.css"
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import { TaskDetailsModal } from './TaskDetailsModal';
export const TaskCard = ({task,deleteTask,column,updateTask,onAddComment,onDeleteComment}) => {
    const[isEdit,setIsEdit] = useState(false)
    const[showModal,setShowModal] = useState(false)
    
    const {setNodeRef,attributes, listeners,transform, transition,isDragging} = useSortable({
        id:task.id,
        data: {
          type:"Task",
          task,
          column
        },
        disabled: isEdit,
      });
      const style = {
          transition,
          transform: CSS.Transform.toString(transform),
    }; 
    if(isDragging){
        return(
            <div ref={setNodeRef} style={style} className="task-content-dragging">
                <div>{task.content}</div>
                <span className="delete-task-content" onClick={(e)=>{ e.stopPropagation();deleteTask(column.id,task.id)}}><DeleteIcon/></span>
            </div>
        )
    }
  return (
    <>
      <div className="task-content" onClick={()=>setShowModal(true)}
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}>
          {!isEdit &&(
              <>
                  <div className="task-content-main">
                      <div className="task-text">{task.content}</div>
                      <div className="task-actions">
                          {task.comments && task.comments.length > 0 && (
                              <span className="comment-count">
                                  <ChatBubbleOutlineIcon fontSize="small" />
                                  {task.comments.length}
                              </span>
                          )}
                          <span className="delete-task-content" onClick={(e)=>{ e.stopPropagation();deleteTask(column.id,task.id)}}>
                              <DeleteIcon/>
                          </span>
                      </div>
                  </div>
              </>
          )}
          {isEdit && (
              <ClickAwayListener onClickAway= {()=>{setIsEdit(false)}}>
              <textarea 
                  value={task.content}
                  onChange={(e)=>updateTask(task.id,e.target.value)}
                  autoFocus
                  onKeyDown={(e)=>{
                  if(e.key === "Enter"){
                    e.preventDefault();
                    setIsEdit(false);
                  }
                  if(e.key === "Escape"){
                    setIsEdit(false);
                  }
                  }}
              />
              </ClickAwayListener>
          )}
      </div>
      
      <TaskDetailsModal
          open={showModal}
          onClose={() => setShowModal(false)}
          task={task}
          column={column}
          onUpdateTask={updateTask}
          onDeleteTask={deleteTask}
          onAddComment={onAddComment}
          onDeleteComment={onDeleteComment}
      />
    </>
  )
}
