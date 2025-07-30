import {React,useState,useMemo} from 'react'
import "./componentscss/ColumnContainer.css"
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import { SortableContext, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import { TaskCard } from './TaskCard';
import { DragOverlay } from '@dnd-kit/core';

export const ColumnContainer = ({column,tasks,updateColumn,addTask,deleteColumn,deleteTask,updateTask,onAddComment,onDeleteComment}) => {
  /* const [addTask,setAddTask] = useState(''); */
  /* const [showAdd,setShowAdd] = useState(false)
  const [newTask,setNewTask] = useState('') */
  const [editMode, setEditMode] = useState(false);
  const [columnForm,setColumnForm] = useState(false);
  const {setNodeRef,attributes, listeners,transform, transition,isDragging} = useSortable({
    id:column.id,
    data: {
      type:"Column",
      column,
    },
    disabled: editMode,
  });
  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };
  const taskIds = useMemo(()=>{
    return tasks.map(task =>task.id)
  }, [tasks])

  if (isDragging) {
    return( 
      <div ref={setNodeRef}
          style={style} 
          className="column-when-dragged"
          >
        <div className="column-title">
          {column.title}
        </div>
        <div className="content" style={{display:'flex',flexGrow:1,flexDirection:"column",overflow:"hidden"}} data-droppable="true">
          {tasks.map(task=>(
            <div key={task.id} className="task-content">{task.content}</div>
          ))}
        </div>
    </div>
    )
  }
  return (
    <>
        <div className="column"
          ref={setNodeRef}
          style={style}
        >
            <div className="column-title"
              {...attributes}
              {...listeners}
              onClick={()=>setEditMode(true)}
            >
                {!editMode && column.title}
                {editMode && (
                  <input 
                  value={column.title}
                  onChange={(e)=>updateColumn(column.id,e.target.value)}
                  autoFocus
                  onBlur={()=>{
                    setEditMode(false);
                  }}
                  onKeyDown={(e)=>{
                    if(e.key === "Enter"){
                      e.preventDefault();
                      setEditMode(false);
                    }
                  }}
                  />
                  )}
                <span onClick={(e)=>{
                  e.stopPropagation();
                  deleteColumn(column.id)
                }}>
                  <MoreHorizIcon/>
                </span>
            </div>
            <div style={{display:'flex',flexGrow:1,flexDirection:"column",overflowX:"hidden"}} className="content">
              <SortableContext items={taskIds}>
                {tasks?.map(task =>(
                  <TaskCard 
                  key={task.id} 
                  task={task} 
                  deleteTask={deleteTask} 
                  column={column} 
                  updateTask={updateTask}
                  onAddComment={onAddComment}
                  onDeleteComment={onDeleteComment}
                  /> /* renders the text elements instead  */
                ))}
              </SortableContext>
            </div>
            <div className="add-tasks" onClick={()=>addTask(column.id,"")}>
              <AddCircleOutlineOutlinedIcon/>Add Tasks
            </div>
        </div>
        {/* {showAdd && (
          <form className="task-form">
            <ClickAwayListener onClickAway={() => setShowAdd(false)}>
              <input placeholder="Enter task" onChange={(e)=>setNewTask(e.target.value)}></input>
            </ClickAwayListener>
          </form>
        )} */}
    </>
  )
}
