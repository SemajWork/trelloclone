import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { styled, alpha } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import EditIcon from '@mui/icons-material/Edit';
import Divider from '@mui/material/Divider';
import ArchiveIcon from '@mui/icons-material/Archive';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import Popper from '@mui/material/Popper';
import MenuList from '@mui/material/MenuList';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Paper from '@mui/material/Paper';
import Grow from '@mui/material/Grow';
const Dropdown = ({items}) =>{
    if(items.length<1){
        console.error("Length is less than 1")
        return <div>HAS TO BE ATLEAST ONE LONG</div>
    }
    const navigate = useNavigate();
    const [open,setOpen] = React.useState(false); // Controls the state of whether the menu is open or not
    const anchorRef = React.useRef(null); //Is a reference to button representing the dropdown menu -- Used as an anchor to the position of the popper

    const handleClick = (index) => {
        if(index !== 0){
            setOpen(false);
            navigate(items[index].page); //redirects user to another page whne clicked
        }
    };
    const handleToggle = () => {
        setOpen((prevOpen)=>!prevOpen); //Inverts the current state of it, i.e if open it makes it closed by making setOpen false
    }

    const handleClose = (event) => {
        if(anchorRef.current && anchorRef.current.contains(event.target)){ //if an action is done inside ignore, otherwise prompt it to close 
            return;
        }
        setOpen(false);
    };

    // return focus to the button when we transitioned from !open -> open
    const prevOpen = React.useRef(open);
    React.useEffect(() => {
        if (prevOpen.current === true && open === false) {
        anchorRef.current.focus();
        }

        prevOpen.current = open;
    }, [open]);

    return(
        <>  
            <Button 
            ref = {anchorRef}
            id="composition-button"
            aria-controls={open ? 'composition-menu' : undefined}
            aria-expanded={open ? 'true' : undefined}
            aria-haspopup="true"
            onClick={handleToggle}
            sx={{
                color: 'var(--text-primary)',
                backgroundColor: 'transparent',
                '&:hover': {
                    backgroundColor: 'var(--hover-bg)'
                },
                textTransform: 'none',
                fontWeight: 500,
                fontSize: '14px',
                padding: '6px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid transparent',
                '&:focus': {
                    borderColor: 'var(--border-focus)',
                    boxShadow: '0 0 0 2px var(--focus-ring)'
                }
            }}
            >
                {items[0].name} {/* This generates the name as the official header of the menu */}
            </Button>
            <Popper
            open={open}
            anchorEl={anchorRef.current}
            role={undefined}
            placement="bottom-start"
            transition
            disablePortal={false}
            style={{ zIndex: 9999 }}
            >
                
                <Grow>
                    <Paper 
                        elevation={8}
                        sx={{
                            zIndex: 9999,
                            '& .MuiMenuList-root': {
                                zIndex: 9999
                            }
                        }}
                    >
                        <ClickAwayListener onClickAway={handleClose}>
                            <MenuList 
                                sx={{ 
                                    zIndex: 9999,
                                    backgroundColor: 'var(--bg-primary)',
                                    border: '1px solid var(--border-primary)',
                                    borderRadius: 'var(--radius-md)',
                                    boxShadow: 'var(--shadow-heavy)',
                                    minWidth: '200px'
                                }}
                            >
                                {items.slice(1).map((item,index)=>( //dynamically generates buttons for the menu
                                    <MenuItem 
                                        key={index} 
                                        onClick={()=>handleClick(index+1)}
                                        sx={{
                                            '&:hover': {
                                                backgroundColor: 'var(--hover-bg)'
                                            },
                                            color: 'var(--text-primary)',
                                            fontSize: '14px',
                                            padding: '8px 16px'
                                        }}
                                    >
                                        {item.name}
                                    </MenuItem>
                                ))}
                            </MenuList>
                        </ClickAwayListener>
                    </Paper>
                </Grow>
            </Popper>
            
        </>
    )
}

export default Dropdown;

/* 
In each item when clicked, it will call function handleClick, that function will redirect user to href/page stored inside the index of the item clicked
*/