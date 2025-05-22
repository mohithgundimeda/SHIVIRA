/* 
    Where would you like to travel? *,
    Your Name,*
    Your Contact Number, *
    Your Email Address, *,
    When would you like to travel?,
    How many days would you like to stay?,
    Number of Adults, min=1
    Number of Children (2-12 years), def=0
    Number of Infants (0-2 years), def = 0
    Which city will you be departing from?
    What’s your preferred budget for this trip? (Optional)
    Tell us about your trip or any special requests (Optional)
    By submitting this form, you agree to allow us to contact you via phone or email.  
*/
import React, { useState } from "react";
import styles from '../Styles/Form.module.css';
import Input from '@mui/material/Input';
import { DatePicker } from 'antd';
import { InputNumber } from 'antd';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import Snackbar from '@mui/material/Snackbar';
import Slide from '@mui/material/Slide'; // Added for SlideTransition
import {useIsMobile} from './useIsMobile.js';

// Define SlideTransition function


const isAlpha = (str) => {
  if (!str) return false;
  return /^[a-zA-Z\s'-]+$/.test(str);
};

const isValidPhoneNumber = (number) => {
  if (!number) return false;
  const cleanedNumber = number.replace(/[^0-9+]/g, '');
  const phoneRegex = /^\+?[0-9]{7,15}$/;
  const isRepetitive = /^(\d)\1+$/.test(cleanedNumber.replace(/^\+/, ''));
  return phoneRegex.test(cleanedNumber) && !isRepetitive;
};

const isValidEmailDomain = (email) => {
  if (!email) return false;
  const validDomains = [
    'gmail.com',
    'yahoo.com',
    'hotmail.com',
    'outlook.com',
    'aol.com',
    'icloud.com',
    'protonmail.com',
    'proton.me',
    'zoho.com',
    'gmx.com',
    'mail.com',
    'rediffmail.com',
    'yandex.com',
    'qq.com',
    'naver.com'
  ];
  
  return validDomains.some(domain => email.toLowerCase().endsWith(domain));
};

export default function Form({ destination = '' }) {
  const isMobile = useIsMobile();

  const vertical = isMobile? 'top':'bottom';
  const horizontal = isMobile? 'center':'left';

  function SlideTransition(props) {
            return <Slide {...props} direction={isMobile ? "down" : "up"} />;
          }
  
  
  const [formData, setFormData] = useState({
    destination: destination,
    name: '',
    contactNumber: '',
    email: '',
    travelDate: null,
    stayDays: '',
    adults: 1,
    children: 0,
    infants: 0,
    departureCity: '',
    budget: '',
    specialRequests: ''
  });

  const [errorQueue, setErrorQueue] = useState([]); // Queue for error messages
  const [open, setOpen] = useState(false); // Snackbar open state

  const handleClick = (concern) => {
    setErrorQueue(prev => [...prev, concern]); // Add new error to queue
    setOpen(true);
  };

  const handleClose = () => {
    setErrorQueue(prev => prev.slice(1)); // Remove the first message
    if (errorQueue.length > 1) {
      setOpen(true); // Keep Snackbar open for next message
    } else {
      setOpen(false); // Close Snackbar when queue is empty
    }
  };

  const handleInputChange = (field) => (event) => {
    setFormData({ ...formData, [field]: event.target.value });
  };

  const handleDateChange = (date) => {
    setFormData({ ...formData, travelDate: date });
  };

  const handleNumberChange = (field) => (value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = () => {
    const requiredFields = ['destination', 'name', 'contactNumber', 'email'];
    const isValid = requiredFields.every(field => formData[field] && formData[field].toString().trim() !== '');
    
    const errors = [];
    if (!isValid) {
      errors.push('Please fill all required fields');
    }
    if (!isAlpha(formData.name) && formData.name.length) {
      errors.push('Name must contain only letters, spaces, hyphens, or apostrophes');
    }
    if (!isValidPhoneNumber(formData.contactNumber) && formData.contactNumber.length ) {
      errors.push('Invalid contact number. Use 7-15 digits, optionally with a country code (e.g., +12025550123)');
    }
    if (!isValidEmailDomain(formData.email) && formData.email.length) {
      errors.push('Email must use a valid domain (e.g., gmail.com, outlook.com)');
    }

    if (errors.length === 0) {
      console.log('Form Data:', formData);
    } else {
      errors.forEach((err) => { handleClick(err); });
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.topContainer}>
        <div className={styles.logoContainer}>
          <img
            src="/static/logo4.png"
            alt="shivira logo"
            loading="eager"
            width="100"
            height="100"
            className={styles.logo}
          />
        </div>
        <p className={styles.text}>By submitting this form, you agree to allow us to contact you via phone or email.</p>
      </div>

      <div className={styles.bottomContainer}>
         
        <div className={styles.grid}>
          <div>
            <p>Where would you like to travel? *</p>
            <Input required fullWidth 
              value={formData.destination}
              onChange={handleInputChange('destination')}
              sx={{
                cursor: 'pointer',
                '& input': {
                  cursor: 'pointer',
                },
                '&:focus-within': {
                  cursor: 'text',
                  '& input': {
                    cursor: 'text',
                  },
                },
                '&:before': {
                  borderBottom: '1px solid black', // Default line
                },
                '&:hover:not(.Mui-disabled):before': {
                  borderBottom: '2px solid black', // On hover
                },
                '&:after': {
                  borderBottom: '2px solid black', // Active/focused
                },
              }}
            />
          </div>

          <div>
            <p>Your Name *</p>
            <Input required fullWidth 
              value={formData.name}
              onChange={handleInputChange('name')}
              sx={{
                cursor: 'pointer',
                '& input': {
                  cursor: 'pointer',
                },
                '&:focus-within': {
                  cursor: 'text',
                  '& input': {
                    cursor: 'text',
                  },
                },
                '&:before': {
                  borderBottom: '1px solid black',
                },
                '&:hover:not(.Mui-disabled):before': {
                  borderBottom: '2px solid black', 
                },
                '&:after': {
                  borderBottom: '2px solid black',
                },
              }} />
          </div>

          <div>
            <p>Your Contact Number *</p>
            <Input
              required
              type="number"
              fullWidth
              value={formData.contactNumber}
              onChange={handleInputChange('contactNumber')}
              inputProps={{
                inputMode: 'numeric',
                pattern: '[0-9]*',
              }}
              sx={{
                cursor: 'pointer',
                '& input': {
                  cursor: 'pointer',
                  '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button': {
                    WebkitAppearance: 'none',
                    margin: 0,
                  },
                  '&[type=number]': {
                    MozAppearance: 'textfield',
                  },
                },
                '&:focus-within': {
                  cursor: 'text',
                  '& input': {
                    cursor: 'text',
                  },
                },
                '&:before': {
                  borderBottom: '1px solid black',
                },
                '&:hover:not(.Mui-disabled):before': {
                  borderBottom: '2px solid black',
                },
                '&:after': {
                  borderBottom: '2px solid black',
                },
              }}
            />
          </div>

          <div>
            <p>Your Email Address *</p>
            <Input required type="email"
              value={formData.email}
              onChange={handleInputChange('email')}
              fullWidth sx={{
                cursor: 'pointer',
                '& input': {
                  cursor: 'pointer',
                },
                '&:focus-within': {
                  cursor: 'text',
                  '& input': {
                    cursor: 'text',
                  },
                },
                '&:before': {
                  borderBottom: '1px solid black', // Default line
                },
                '&:hover:not(.Mui-disabled):before': {
                  borderBottom: '2px solid black', // On hover
                },
                '&:after': {
                  borderBottom: '2px solid black', // Active/focused
                },
              }}/>
          </div>

          <div>
            <p>When would you like to travel?</p>
            <DatePicker className="customDatePicker" placeholder="" style={{background:'transparent'}}
              value={formData.travelDate}
              onChange={handleDateChange}
            />
          </div>

          <div>
            <p>How many days would you like to stay?</p>
            <Input required type="email" fullWidth
              value={formData.stayDays}
              onChange={handleInputChange('stayDays')}
              sx={{
                cursor: 'pointer',
                '& input': {
                  cursor: 'pointer',
                },
                '&:focus-within': {
                  cursor: 'text',
                  '& input': {
                    cursor: 'text',
                  },
                },
                '&:before': {
                  borderBottom: '1px solid black', // Default line
                },
                '&:hover:not(.Mui-disabled):before': {
                  borderBottom: '2px solid black', // On hover
                },
                '&:after': {
                  borderBottom: '2px solid black', // Active/focused
                },
              }}/>
          </div>

          <div>
            <p>Number of Adults</p>
            <InputNumber className="custom-input-number" min={1} max={15} defaultValue={1} style={{borderRadius:'0px', width:'100%' ,background:'transparent', borderTop:'0',borderLeft:'0',borderRight:'0',borderBottom:'1px solid black',}}
              value={formData.adults}
              onChange={handleNumberChange('adults')}
            />
          </div>

          <div>
            <p> Number of Children (2-12 years)</p>
            <InputNumber className="custom-input-number" min={0} max={15} defaultValue={0} style={{borderRadius:'0px',  width:'100%' ,background:'transparent', borderTop:'0',borderLeft:'0',borderRight:'0',borderBottom:'1px solid black',}}
              value={formData.children}
              onChange={handleNumberChange('children')}
            />
          </div>

          <div>
            <p>Number of Infants (0-2 years)</p>
            <InputNumber  className="custom-input-number" min={0} max={15} defaultValue={0} style={{borderRadius:'0px',  width:'100%' ,background:'transparent', borderTop:'0',borderLeft:'0',borderRight:'0',borderBottom:'1px solid black',}}
              value={formData.infants}
              onChange={handleNumberChange('infants')}
            />
          </div>

          <div className={styles.cityField}>
            <p>Which city will you be departing from?</p>
            <Input
              fullWidth
              value={formData.departureCity}
              onChange={handleInputChange('departureCity')}
              sx={{
                cursor: 'pointer',
                '& input': {
                  cursor: 'pointer',
                },
                '&:focus-within': {
                  cursor: 'text',
                  '& input': {
                    cursor: 'text',
                  },
                },
                '&:before': {
                  borderBottom: '1px solid black',
                },
                '&:hover:not(.Mui-disabled):before': {
                  borderBottom: '2px solid black',
                },
                '&:after': {
                  borderBottom: '2px solid black',
                },
              }}
            />
          </div>

          <div className={styles.budgetField}>
            <p>What’s your preferred budget for this trip? (Optional)</p>
            <Input
              fullWidth
              type="number"
              id="standard-adornment-amount"
              value={formData.budget}
              onChange={handleInputChange('budget')}
              startAdornment={<InputAdornment position="start">₹</InputAdornment>}
              sx={{
                cursor: 'pointer',
                '& input': {
                  cursor: 'pointer',
                  '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button': {
                    WebkitAppearance: 'none',
                    margin: 0,
                  },
                  '&[type=number]': {
                    MozAppearance: 'textfield',
                  },
                },
                '&:focus-within': {
                  cursor: 'text',
                  '& input': {
                    cursor: 'text',
                  },
                },
                '&:before': {
                  borderBottom: '1px solid black',
                },
                '&:hover:not(.Mui-disabled):before': {
                  borderBottom: '2px solid black',
                },
                '&:after': {
                  borderBottom: '2px solid black',
                },
              }}
            />
          </div>

          <div className={styles.fullWidthField}>
            <p>Tell us about your trip or any special requests (Optional)</p>
            <TextField
              fullWidth
              id="standard-textarea"
              multiline
              maxRows={3}
              variant="standard"
              className="custom-multiline-textfield"
              value={formData.specialRequests}
              onChange={handleInputChange('specialRequests')}
              InputProps={{
                disableUnderline: false,
              }}
              sx={{
                '& .MuiInput-underline:before': {
                  borderBottom: '1px solid black',
                },
                '& .MuiInput-underline:hover:before': {
                  borderBottom: '2px solid black',
                },
                '& .MuiInput-underline:after': {
                  borderBottom: '2px solid black',
                },
              }}
            />
          </div>
        </div>
      
        <div className={styles.buttonContainer}>
          <button className={styles.button} onClick={handleSubmit}>SEND</button>
          <p className={styles.policy}>We are committed to safeguarding your privacy. Your personal information will be handled with the utmost confidentiality and will not be used for commercial purposes without your explicit consent. For more details, please review our <a href="/privacy-policy">Privacy Policy</a>.</p>
        </div>
      
      </div>
      <Snackbar
        anchorOrigin={{ vertical, horizontal }}
        open={open}
        onClose={handleClose}
        message={errorQueue[0]}
        key={vertical + horizontal + (errorQueue[0] || '')}
        autoHideDuration={4000}
        TransitionComponent={SlideTransition}
        sx={{
              '& .MuiSnackbarContent-root': {
                backgroundColor: '#333',
                '& .MuiSnackbarContent-message': {
                  color: 'white',
                  fontFamily:'monospace',
                },
              },
              maxWidth: { xs: '80vw', sm: '80vw' },
              width: '100%',
              boxSizing: 'border-box',
            }}
      />
    </div>
  );
}