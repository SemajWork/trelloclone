import {React, useState, useEffect} from 'react'
import { useParams } from 'react-router-dom'
import "./pagecss/Boards.css"
import Button from '@mui/material/Button';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import DashboardIcon from '@mui/icons-material/Dashboard';
import StarIcon from '@mui/icons-material/Star';
import ShareIcon from '@mui/icons-material/Share';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { ColumnContainer } from '../components/ColumnContainer';
import { DndContext,DragOverlay,useSensors,useSensor,PointerSensor} from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';
import {createPortal} from 'react-dom';
import { arrayMove } from '@dnd-kit/sortable';
import { TaskCard } from '../components/TaskCard';
import {v4 as uuid} from 'uuid';
import { ClickAwayListener, TextField } from '@mui/material';


export const Boards = () => {

  const {id} = useParams();
  const [boardName, setBoardName] = useState('');
  const [toggleMenu,setToggleMenu] = useState(false);
  const [taskList,setTaskList] = useState(() => {
    const saved = localStorage.getItem(`Boards_${id}`);
    return saved ? JSON.parse(saved) : {
      tasks: {},
      columns: {},
      columnOrder: []
    };
  });

  useEffect(()=>{
    const saved = localStorage.getItem(`Boards_${id}`);
    if(saved){
      setTaskList(JSON.parse(saved));
    }else{
      setTaskList({
        tasks: {},
        columns: {},
        columnOrder: []
      });
    }
  },[id]);

  useEffect(() => {
    localStorage.setItem(`Boards_${id}`, JSON.stringify(taskList));
  }, [taskList]);

  // Get board name from allBoards
  useEffect(() => {
    const allBoards = JSON.parse(localStorage.getItem('allBoards') || '[]');
    const board = allBoards.find(board => board.id === id);
    if (board) {
      setBoardName(board.name);
      setIsStarred(board.starred || false);
    } else {
      setBoardName(`Board ${id}`);
    }
  }, [id]);

  
  const [activeColumn,setActiveColumn] = useState(null); //will keep track of column types
  const [activeTask,setActiveTask] = useState(null);
  const [isStarred, setIsStarred] = useState(false);
  
  //creates a new column 
  const addCard = () => {
    let column = {id:uuid(),
                  title:`Column List  ${Object.keys(taskList.columns).length +1}`,
                  taskIds:[]}
    setTaskList(prev=>({
      ...prev,
      columns:{...prev.columns,[column.id]:column},
      columnOrder: [...prev.columnOrder,column.id]
    }));
  };
  
  //add task to column
  const addTask = (colId,task) => {
    const newTask = {
      id: uuid(),
      content: (task.trim() !== "") ? task : `${taskList.columns[colId].taskIds.length+1}`
    }
    setTaskList(prev=>({
      ...prev,
      columns:{...prev.columns,
        [colId]:{
        ...prev.columns[colId],
        taskIds: [...prev.columns[colId].taskIds,newTask.id],
      }},
      tasks: {...prev.tasks,[newTask.id]:newTask}
    }))
  }


  //will delete the column
  const deleteColumn = (columnId) =>{
    setTaskList(prev =>{
      const {[columnId]: _, ...restColumns} = prev.columns;
      return {
        ...prev,
        columns: restColumns,
        columnOrder: prev.columnOrder.filter(id=>id!==columnId),
      };
    });
  };
  
  //delete task
  const deleteTask = (colId,taskId) =>{
    setTaskList(prev=>{
      const {[taskId]:_,...restTasks} = prev.tasks
      return {
        ...prev,
        tasks:restTasks,
        columns:{
          ...prev.columns,
          [colId]:{
            ...prev.columns[colId],
            taskIds: prev.columns[colId].taskIds.filter(id=>id !== taskId)
          }
        }
      }
    })
  }
  
  //updates column title
  const updateColumn = (id, newTitle) =>{
    setTaskList(prev=>({
      ...prev,
      columns:{
        ...prev.columns,
        [id]:{
          ...prev.columns[id],
          title: newTitle
        }
      }
    }))
  }

  //update task
  const updateTask = (taskId,newTask) =>{
    setTaskList(prev=>({
      ...prev,
      tasks:{
        ...prev.tasks,
        [taskId]:{
          ...prev.tasks[taskId],
          content:newTask
        }
      }
    }))
  }

  const addComment = (taskId, commentText) => {
    const newComment = {
      text: commentText,
      author: 'User', // You can replace this with actual user name
      timestamp: new Date().toISOString()
    };

    setTaskList(prev => ({
      ...prev,
      tasks: {
        ...prev.tasks,
        [taskId]: {
          ...prev.tasks[taskId],
          comments: [...(prev.tasks[taskId].comments || []), newComment]
        }
      }
    }));
  };

  const deleteComment = (taskId, commentIndex) => {
    setTaskList(prev => ({
      ...prev,
      tasks: {
        ...prev.tasks,
        [taskId]: {
          ...prev.tasks[taskId],
          comments: prev.tasks[taskId].comments.filter((_, index) => index !== commentIndex)
        }
      }
    }));
  };

  const onDragStart = (event) =>{
    console.log("Drag Start",event);
    console.log('Active data:',event.active.data.current);
    if (event.active.data.current?.type === "Column"){ //check type if only data.current exists
      setActiveColumn(event.active.data.current.column);
      setActiveTask(null);
      return;
    }
    if (event.active.data.current?.type === "Task"){ //check type if only data.current exists
      setActiveTask(event.active.data.current.task);
      setActiveColumn(null);
      return;
    }
  }
  
  const onDragEnd = (event) =>{
    setActiveTask(null)
    setActiveColumn(null)

    const {active,over} = event;

    if(!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveTask = active.data.current?.type === "Task";
    const isOverATask = over.data.current?.type === "Task";
    const isActiveColumn = active.data.current?.type === "Column";
    const isOverColumn = over.data.current?.type === "Column";

    // Handle column reordering
    if (isActiveColumn && isOverColumn) {
      setTaskList(prev => {
        const activeColumnIndex = prev.columnOrder.findIndex(id => id === activeId);
        const overColumnIndex = prev.columnOrder.findIndex(id => id === overId);
        
        return {
          ...prev,
          columnOrder: arrayMove(prev.columnOrder, activeColumnIndex, overColumnIndex)
        };
      });
      return;
    }

    // Handle task reordering
    if (isActiveTask) {
      const activeCol = active.data.current?.column.id;
      const overCol = over.data.current?.column.id;

      setTaskList(prev => {
        const activeIndex = prev.columns[activeCol].taskIds.indexOf(activeId);
        
        if (isOverATask) {
          // Moving task over another task
          const overIndex = prev.columns[overCol].taskIds.indexOf(overId);
          
          if (activeCol === overCol) {
            // Same column
            const newList = arrayMove(prev.columns[activeCol].taskIds, activeIndex, overIndex);
            return {
              ...prev,
              columns: {
                ...prev.columns,
                [activeCol]: {
                  ...prev.columns[activeCol],
                  taskIds: newList,
                }
              }
            };
          } else {
            // Different columns
            const currActiveTaskList = [...prev.columns[activeCol].taskIds];
            currActiveTaskList.splice(activeIndex, 1);
            const currOverTaskList = [
              ...prev.columns[overCol].taskIds.slice(0, overIndex),
              activeId,
              ...prev.columns[overCol].taskIds.slice(overIndex)
            ];
            return {
              ...prev,
              columns: {
                ...prev.columns,
                [activeCol]: {
                  ...prev.columns[activeCol],
                  taskIds: currActiveTaskList
                },
                [overCol]: {
                  ...prev.columns[overCol],
                  taskIds: currOverTaskList
                }
              }
            };
          }
        } else {
          // Moving task over a column (dropping into column)
          if (activeCol === overCol) return prev;
          const currActiveTaskList = [...prev.columns[activeCol].taskIds];
          currActiveTaskList.splice(activeIndex, 1);
          return {
            ...prev,
            columns: {
              ...prev.columns,
              [activeCol]: {
                ...prev.columns[activeCol],
                taskIds: currActiveTaskList
              },
              [overCol]: {
                ...prev.columns[overCol],
                taskIds: [...prev.columns[overCol].taskIds, activeId]
              }
            }
          };
        }
      });
    }
  }
  
  const handleDragCancel = () =>{
    setActiveTask(null);
    setActiveColumn(null);
  }

  const toggleStar = () => {
    setIsStarred(!isStarred);
    // Update in localStorage
    const allBoards = JSON.parse(localStorage.getItem('allBoards') || '[]');
    const boardIndex = allBoards.findIndex(board => board.id === id);
    if (boardIndex !== -1) {
      allBoards[boardIndex].starred = !isStarred;
      localStorage.setItem('allBoards', JSON.stringify(allBoards));
    }
  };

  const handleShare = () => {
    // Copy board URL to clipboard
    navigator.clipboard.writeText(window.location.href);
    // You could add a toast notification here
    alert('Board URL copied to clipboard!');
  };
  
  //it will only activate drag event if pointer sensor sees that the cursor is dragged mroe than 300px
  const sensors = useSensors(
    useSensor(PointerSensor,{
      activationConstraint: {
        distance: 3,//300px
      },
    }))
    
  const deleteBoard = () =>{
    
  }
  return (
    <>
    <div className="board-container">
      <div className="board-header-content">
        <h1 className="board-title">
          <DashboardIcon className="board-icon" />
          <span className="board-title-text">{boardName}</span>
        </h1>
        <p className="board-subtitle">Board • {taskList.columnOrder.length} columns • {Object.keys(taskList.tasks).length} tasks</p>
      </div>
      <div className="board-actions">
        <button className="board-action-btn" onClick={toggleStar}>
          <StarIcon style={{ fontSize: 18, color: isStarred ? '#FFD700' : 'white' }} />
        </button>
        <button className="board-action-btn" onClick={handleShare}>
          <ShareIcon style={{ fontSize: 18 }} />
        </button>
        <button className="board-action-btn" onClick={()=>setToggleMenu(true)}>
          <MoreVertIcon style={{ fontSize: 18 }} />
        </button>
      </div>
    </div>
    {toggleMenu && (
      <ClickAwayListener onClickAway={()=>setToggleMenu(false)}>
        <form className="board-menu">
          <TextField placeholder="Hello"></TextField>
        </form>
      </ClickAwayListener>
    )}
    <DndContext onDragStart={onDragStart} onDragEnd={onDragEnd} onDragCancel={handleDragCancel} sensors={sensors}>
    <div className="board-list">
      <SortableContext items={taskList.columnOrder}>
        {taskList.columnOrder.map(columnId =>(
          <ColumnContainer
            key={columnId}
            column={taskList.columns[columnId]}
            tasks={taskList.columns[columnId].taskIds
              .map(taskId => taskList.tasks[taskId])
              .filter(Boolean)} // <-- filter out undefined
            deleteColumn={deleteColumn}
            updateColumn={updateColumn}
            addTask={addTask}
            deleteTask={deleteTask}
            updateTask={updateTask}
            onAddComment={addComment}
            onDeleteComment={deleteComment}
          />
        ))}
      </SortableContext>
      <div className="input-columns" onClick={addCard}>
        <AddCircleOutlineOutlinedIcon className="add-symbol" />
        <h4>
          Add Column
        </h4>
      </div>
    </div>
    
    { createPortal(
      <DragOverlay style={{color:"white"}}>
        {activeColumn && (
          <ColumnContainer 
            column={activeColumn}
            tasks={activeColumn.taskIds.map(taskId => taskList.tasks[taskId]).filter(Boolean)}
            deleteColumn={deleteColumn}
            updateColumn={updateColumn}
            addTask={addTask}
            deleteTask={deleteTask}
            updateTask={updateTask}
          />
        )}
        {activeTask && (
          <TaskCard 
            task={activeTask} 
            deleteTask={deleteTask}
            updateTask={updateTask}
          />
        )}
      </DragOverlay>, 
      document.body
    )}
    </DndContext>
    </>
  )
}
