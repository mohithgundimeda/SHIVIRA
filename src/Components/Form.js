// import React, { useState, useEffect, useRef} from "react";
// import styles from '../Styles/Form.module.css';
// import Input from '@mui/material/Input';
// import { DatePicker } from 'antd';
// import { InputNumber } from 'antd';
// import InputAdornment from '@mui/material/InputAdornment';
// import TextField from '@mui/material/TextField';
// import Snackbar from '@mui/material/Snackbar';
// import Slide from '@mui/material/Slide';
// import {useIsMobile} from './useIsMobile.js';
// import { useLocation } from "react-router-dom";
// import { sendEmailApi } from '../services/api';


// const isAlpha = (str) => {
//   if (!str) return false;
//   return /^[a-zA-Z\s'-]+$/.test(str);
// };

// const isValidPhoneNumber = (number) => {
//   if (!number) return false;
//   const cleanedNumber = number.replace(/[^0-9+]/g, '');
//   const phoneRegex = /^\+?[0-9]{7,15}$/;
//   const isRepetitive = /^(\d)\1+$/.test(cleanedNumber.replace(/^\+/, ''));
//   return phoneRegex.test(cleanedNumber) && !isRepetitive;
// };

// const isValidEmailDomain = (email) => {
//   if (!email) return false;
//   const validDomains = [
//     'gmail.com',
//     'yahoo.com',
//     'hotmail.com',
//     'outlook.com',
//     'aol.com',
//     'icloud.com',
//     'protonmail.com',
//     'proton.me',
//     'zoho.com',
//     'gmx.com',
//     'mail.com',
//     'rediffmail.com',
//     'yandex.com',
//     'qq.com',
//     'naver.com'
//   ];
  
//   return validDomains.some(domain => email.toLowerCase().endsWith(domain));
// };

// export default function Form() {
//   const isMobile = useIsMobile();
//   const location = useLocation();
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [success, setSuccess] = useState(null);
//   const abortControllerRef = useRef(null);
//   const destination = location.state?.destination?.trim() || '';

//   const vertical = isMobile? 'top':'bottom';
//   const horizontal = isMobile? 'center':'left';

//   function SlideTransition(props) {
//             return <Slide {...props} direction={isMobile ? "down" : "up"} />;
//           }
  
  
//   const [formData, setFormData] = useState({
//     destination: destination,
//     name: '',
//     contactNumber: '',
//     email: '',
//     travelDate: null,
//     stayDays: '',
//     adults: 1,
//     children: 0,
//     infants: 0,
//     departureCity: '',
//     budget: '',
//     specialRequests: ''
//   });

//   const [errorQueue, setErrorQueue] = useState([]);
//   const [open, setOpen] = useState(false);

//   useEffect(() => {
//     return () => abortControllerRef.current?.abort();
//   }, []);

//   const handleClick = (concern) => {
//     setErrorQueue(prev => [...prev, concern]);
//     setOpen(true);
//   };

//   const handleClose = () => {
//     setErrorQueue(prev => prev.slice(1));
//     if (errorQueue.length > 1) {
//       setOpen(true);
//     } else {
//       setOpen(false);
//     }
//   };

//   const handleInputChange = (field) => (event) => {
//     setFormData({ ...formData, [field]: event.target.value });
//   };

//   const handleDateChange = (date) => {
//     setFormData({ ...formData, travelDate: date });
//   };

//   const handleNumberChange = (field) => (value) => {
//     setFormData({ ...formData, [field]: value });
//   };

//   const handleSubmit = async () => {
    
//       const requiredFields = ['destination', 'name', 'contactNumber', 'email'];
//       const isValid = requiredFields.every(field => formData[field] && formData[field].toString().trim() !== '');

//       const errors = [];
//       if (!isValid) {
//         errors.push('Please fill all required fields');
//       }
//       if (!isAlpha(formData.name) && formData.name.length) {
//         errors.push('Name must contain only letters, spaces, hyphens, or apostrophes');
//       }
//       if (!isValidPhoneNumber(formData.contactNumber) && formData.contactNumber.length) {
//         errors.push('Invalid contact number. Use 7-15 digits, optionally with a country code (e.g., +12025550123)');
//       }
//       if (!isValidEmailDomain(formData.email) && formData.email.length) {
//         errors.push('Email must use a valid domain (e.g., gmail.com, outlook.com)');
//       }

//       if (errors.length) {
//         errors.forEach(err => handleClick(err));
//         return;
//       }

//       setIsLoading(true);
//       setError(null);
//       setSuccess(null);

//       try {
//           abortControllerRef.current = new AbortController();

//           const response = await sendEmailApi(formData, abortControllerRef.current.signal);
          
//           if (response.success) {
//             setSuccess('Email sent successfully!');
//           } else {
//             setError(response.error || 'Failed to send email');
//           }

//       } catch (err) {
//         if (err.name !== 'AbortError') {
//           setError(err.message);
//         }
//       } finally {
//         setIsLoading(false);
//       }
//   };

//   return (
//     <div className={styles.container}>
//       <div className={styles.topContainer}>
//         <div className={styles.logoContainer}>
//           <img
//             src="/static/logo4.png"
//             alt="shivira logo"
//             loading="eager"
//             width="100"
//             height="100"
//             className={styles.logo}
//           />
//         </div>
//         <p className={styles.text}>By submitting this form, you agree to allow us to contact you via phone or email.</p>
//       </div>

//       <div className={styles.bottomContainer}>
         
//         <div className={styles.grid}>
//           <div>
//             <p>Where would you like to travel? *</p>
//             <Input required fullWidth 
//               value={formData.destination}
//               onChange={handleInputChange('destination')}
//               sx={{
//                 cursor: 'pointer',
//                 '& input': {
//                   cursor: 'pointer',
//                 },
//                 '&:focus-within': {
//                   cursor: 'text',
//                   '& input': {
//                     cursor: 'text',
//                   },
//                 },
//                 '&:before': {
//                   borderBottom: '1px solid black',
//                 },
//                 '&:hover:not(.Mui-disabled):before': {
//                   borderBottom: '2px solid black',
//                 },
//                 '&:after': {
//                   borderBottom: '2px solid black',
//                 },
//               }}
//             />
//           </div>

//           <div>
//             <p>Your Name *</p>
//             <Input required fullWidth 
//               value={formData.name}
//               onChange={handleInputChange('name')}
//               sx={{
//                 cursor: 'pointer',
//                 '& input': {
//                   cursor: 'pointer',
//                 },
//                 '&:focus-within': {
//                   cursor: 'text',
//                   '& input': {
//                     cursor: 'text',
//                   },
//                 },
//                 '&:before': {
//                   borderBottom: '1px solid black',
//                 },
//                 '&:hover:not(.Mui-disabled):before': {
//                   borderBottom: '2px solid black', 
//                 },
//                 '&:after': {
//                   borderBottom: '2px solid black',
//                 },
//               }} />
//           </div>

//           <div>
//             <p>Your Contact Number *</p>
//             <Input
//               required
//               type="number"
//               fullWidth
//               value={formData.contactNumber}
//               onChange={handleInputChange('contactNumber')}
//               inputProps={{
//                 inputMode: 'numeric',
//                 pattern: '[0-9]*',
//               }}
//               sx={{
//                 cursor: 'pointer',
//                 '& input': {
//                   cursor: 'pointer',
//                   '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button': {
//                     WebkitAppearance: 'none',
//                     margin: 0,
//                   },
//                   '&[type=number]': {
//                     MozAppearance: 'textfield',
//                   },
//                 },
//                 '&:focus-within': {
//                   cursor: 'text',
//                   '& input': {
//                     cursor: 'text',
//                   },
//                 },
//                 '&:before': {
//                   borderBottom: '1px solid black',
//                 },
//                 '&:hover:not(.Mui-disabled):before': {
//                   borderBottom: '2px solid black',
//                 },
//                 '&:after': {
//                   borderBottom: '2px solid black',
//                 },
//               }}
//             />
//           </div>

//           <div>
//             <p>Your Email Address *</p>
//             <Input required type="email"
//               value={formData.email}
//               onChange={handleInputChange('email')}
//               fullWidth sx={{
//                 cursor: 'pointer',
//                 '& input': {
//                   cursor: 'pointer',
//                 },
//                 '&:focus-within': {
//                   cursor: 'text',
//                   '& input': {
//                     cursor: 'text',
//                   },
//                 },
//                 '&:before': {
//                   borderBottom: '1px solid black', // Default line
//                 },
//                 '&:hover:not(.Mui-disabled):before': {
//                   borderBottom: '2px solid black', // On hover
//                 },
//                 '&:after': {
//                   borderBottom: '2px solid black', // Active/focused
//                 },
//               }}/>
//           </div>

//           <div>
//             <p>When would you like to travel?</p>
//             <DatePicker className="customDatePicker" placeholder="" style={{background:'transparent'}}
//               value={formData.travelDate}
//               onChange={handleDateChange}
//             />
//           </div>

//           <div>
//             <p>How many days would you like to stay?</p>
//             <Input required type="email" fullWidth
//               value={formData.stayDays}
//               onChange={handleInputChange('stayDays')}
//               sx={{
//                 cursor: 'pointer',
//                 '& input': {
//                   cursor: 'pointer',
//                 },
//                 '&:focus-within': {
//                   cursor: 'text',
//                   '& input': {
//                     cursor: 'text',
//                   },
//                 },
//                 '&:before': {
//                   borderBottom: '1px solid black', // Default line
//                 },
//                 '&:hover:not(.Mui-disabled):before': {
//                   borderBottom: '2px solid black', // On hover
//                 },
//                 '&:after': {
//                   borderBottom: '2px solid black', // Active/focused
//                 },
//               }}/>
//           </div>

//           <div>
//             <p>Number of Adults</p>
//             <InputNumber className="custom-input-number" min={1} max={15} defaultValue={1} style={{borderRadius:'0px', width:'100%' ,background:'transparent', borderTop:'0',borderLeft:'0',borderRight:'0',borderBottom:'1px solid black',}}
//               value={formData.adults}
//               onChange={handleNumberChange('adults')}
//             />
//           </div>

//           <div>
//             <p> Number of Children (2-12 years)</p>
//             <InputNumber className="custom-input-number" min={0} max={15} defaultValue={0} style={{borderRadius:'0px',  width:'100%' ,background:'transparent', borderTop:'0',borderLeft:'0',borderRight:'0',borderBottom:'1px solid black',}}
//               value={formData.children}
//               onChange={handleNumberChange('children')}
//             />
//           </div>

//           <div>
//             <p>Number of Infants (0-2 years)</p>
//             <InputNumber  className="custom-input-number" min={0} max={15} defaultValue={0} style={{borderRadius:'0px',  width:'100%' ,background:'transparent', borderTop:'0',borderLeft:'0',borderRight:'0',borderBottom:'1px solid black',}}
//               value={formData.infants}
//               onChange={handleNumberChange('infants')}
//             />
//           </div>

//           <div className={styles.cityField}>
//             <p>Which city will you be departing from?</p>
//             <Input
//               fullWidth
//               value={formData.departureCity}
//               onChange={handleInputChange('departureCity')}
//               sx={{
//                 cursor: 'pointer',
//                 '& input': {
//                   cursor: 'pointer',
//                 },
//                 '&:focus-within': {
//                   cursor: 'text',
//                   '& input': {
//                     cursor: 'text',
//                   },
//                 },
//                 '&:before': {
//                   borderBottom: '1px solid black',
//                 },
//                 '&:hover:not(.Mui-disabled):before': {
//                   borderBottom: '2px solid black',
//                 },
//                 '&:after': {
//                   borderBottom: '2px solid black',
//                 },
//               }}
//             />
//           </div>

//           <div className={styles.budgetField}>
//             <p>What’s your preferred budget for this trip? (Optional)</p>
//             <Input
//               fullWidth
//               type="number"
//               id="standard-adornment-amount"
//               value={formData.budget}
//               onChange={handleInputChange('budget')}
//               startAdornment={<InputAdornment position="start">₹</InputAdornment>}
//               sx={{
//                 cursor: 'pointer',
//                 '& input': {
//                   cursor: 'pointer',
//                   '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button': {
//                     WebkitAppearance: 'none',
//                     margin: 0,
//                   },
//                   '&[type=number]': {
//                     MozAppearance: 'textfield',
//                   },
//                 },
//                 '&:focus-within': {
//                   cursor: 'text',
//                   '& input': {
//                     cursor: 'text',
//                   },
//                 },
//                 '&:before': {
//                   borderBottom: '1px solid black',
//                 },
//                 '&:hover:not(.Mui-disabled):before': {
//                   borderBottom: '2px solid black',
//                 },
//                 '&:after': {
//                   borderBottom: '2px solid black',
//                 },
//               }}
//             />
//           </div>

//           <div className={styles.fullWidthField}>
//             <p>Tell us about your trip or any special requests (Optional)</p>
//             <TextField
//               fullWidth
//               id="standard-textarea"
//               multiline
//               maxRows={3}
//               variant="standard"
//               className="custom-multiline-textfield"
//               value={formData.specialRequests}
//               onChange={handleInputChange('specialRequests')}
//               InputProps={{
//                 disableUnderline: false,
//               }}
//               sx={{
//                 '& .MuiInput-underline:before': {
//                   borderBottom: '1px solid black',
//                 },
//                 '& .MuiInput-underline:hover:before': {
//                   borderBottom: '2px solid black',
//                 },
//                 '& .MuiInput-underline:after': {
//                   borderBottom: '2px solid black',
//                 },
//               }}
//             />
//           </div>
//         </div>
      
//         <div className={styles.buttonContainer}>
//           <button className={styles.button} onClick={handleSubmit}>{isLoading ? 'Sending...' : 'SEND'}</button>
//           <p className={styles.policy}>We are committed to safeguarding your privacy. Your personal information will be handled with the utmost confidentiality and will not be used for commercial purposes without your explicit consent. For more details, please review our <a href="/privacy-policy">Privacy Policy</a>.</p>
//         </div>
      
//       </div>
//       <Snackbar
//         anchorOrigin={{ vertical, horizontal }}
//         open={open || !!error || !!success}
//         onClose={() => {
//           setError(null);
//           setSuccess(null);
//           handleClose();
//         }}
//         message={error || success || errorQueue[0]}
//         key={vertical + horizontal + (error || success || errorQueue[0] || '')}
//         autoHideDuration={4000}
//         TransitionComponent={SlideTransition}
//         sx={{
//           '& .MuiSnackbarContent-root': {
//             backgroundColor: error ? '#d32f2f' : '#333',
//             '& .MuiSnackbarContent-message': {
//               color: 'white',
//               fontFamily: 'monospace',
//             },
//           },
//           maxWidth: { xs: '80vw', sm: '80vw' },
//           width: '100%',
//           boxSizing: 'border-box',
//         }}
//       />
//     </div>

//   );
// }
import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import Input from '@mui/material/Input';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import Snackbar from '@mui/material/Snackbar';
import Slide from '@mui/material/Slide';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { DatePicker } from 'antd';
import { InputNumber } from 'antd';
import { useIsMobile } from './useIsMobile';
import styles from '../Styles/Form.module.css';
import DOMPurify from 'dompurify';

// Constants
const API_URL = '/send-email';
const VALID_EMAIL_DOMAINS = [
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
  'naver.com',
];

// Validation functions
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
  return VALID_EMAIL_DOMAINS.some(domain => email.toLowerCase().endsWith(domain));
};

// Simple DOMPurify substitute (for single-file constraint)
const sanitizeHtml = (html) => {
  return DOMPurify.sanitize(html, { ALLOWED_TAGS: ['p', 'strong', 'br'] });
};
/**
 * Sends an email with travel inquiry data to the backend.
 * @param {Object} formData - Form data containing travel details.
 * @param {AbortSignal} signal - Signal to abort the request.
 * @returns {Promise<Object>} - Response with success status and data/error.
 * @throws {Error} - If the request fails.
 */
async function sendEmailApi(formData, signal) {
  if (!formData || !Object.keys(formData).length) {
    return { success: false, error: 'Form data is empty' };
  }

  const html = `
    <p><strong>Travel Inquiry</strong></p>
    <p><strong>Name:</strong> ${formData.name}</p>
    <p><strong>Email:</strong> ${formData.email}</p>
    <p><strong>Contact Number:</strong> ${formData.contactNumber}</p>
    <p><strong>Destination:</strong> ${formData.destination}</p>
    <p><strong>Travel Date:</strong> ${formData.travelDate?.format('YYYY-MM-DD') || 'Not specified'}</p>
    <p><strong>Stay Days:</strong> ${formData.stayDays || 'Not specified'}</p>
    <p><strong>Adults:</strong> ${formData.adults}</p>
    <p><strong>Children:</strong> ${formData.children}</p>
    <p><strong>Infants:</strong> ${formData.infants}</p>
    <p><strong>Departure City:</strong> ${formData.departureCity || 'Not specified'}</p>
    <p><strong>Budget:</strong> ${formData.budget ? `₹${formData.budget}` : 'Not specified'}</p>
    <p><strong>Special Requests:</strong> ${formData.specialRequests || 'None'}</p>
  `;
  const sanitizedHtml = sanitizeHtml(html);

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add CSRF token header in production (requires backend support)
      },
      body: JSON.stringify({
        to: formData.email,
        subject: `Travel Inquiry: ${formData.destination}`,
        html: sanitizedHtml,
      }),
      signal,
    });

    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      let errorMessage = `HTTP Error! Status: ${response.status}`;
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        errorMessage = data.error || errorMessage;
      } else {
        const text = await response.text();
        errorMessage = `Unexpected server response: ${text.slice(0, 100)}...`;
      }
      throw new Error(errorMessage);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Server returned an unexpected response format.');
    }

    return await response.json();
  } catch (error) {
    if (error.name !== 'AbortError') {
      console.error('API Error:', error);
      throw error;
    }
    return { success: false, error: 'Request aborted' };
  }
}

/**
 * Form component for submitting travel inquiries.
 * @returns {JSX.Element} - The form UI.
 */
export default function Form() {
  const isMobile = useIsMobile();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [errorQueue, setErrorQueue] = useState([]);
  const [open, setOpen] = useState(false);
  const abortControllerRef = useRef(null);
  const destination = location.state?.destination?.trim() || '';

  const vertical = isMobile ? 'top' : 'bottom';
  const horizontal = isMobile ? 'center' : 'left';

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
    specialRequests: '',
  });

  useEffect(() => {
    return () => abortControllerRef.current?.abort();
  }, []);

  const handleClick = (concern) => {
    setErrorQueue(prev => [...prev, concern]);
    setOpen(true);
  };

  const handleClose = () => {
    setErrorQueue(prev => prev.slice(1));
    setOpen(errorQueue.length > 1);
    setError(null);
    setSuccess(null);
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

  const validateForm = () => {
    const requiredFields = ['destination', 'name', 'contactNumber', 'email'];
    const errors = [];

    if (!requiredFields.every(field => formData[field]?.toString().trim())) {
      errors.push('Please fill all required fields');
    }
    if (formData.name && !isAlpha(formData.name)) {
      errors.push('Name must contain only letters, spaces, hyphens, or apostrophes');
    }
    if (formData.contactNumber && !isValidPhoneNumber(formData.contactNumber)) {
      errors.push('Invalid contact number. Use 7-15 digits, optionally with a country code (e.g., +12025550123)');
    }
    if (formData.email && !isValidEmailDomain(formData.email)) {
      errors.push('Email must use a valid domain (e.g., gmail.com, outlook.com)');
    }

    return errors;
  };

  const handleSubmit = async () => {
    const errors = validateForm();
    if (errors.length) {
      errors.forEach(handleClick);
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      abortControllerRef.current = new AbortController();
      const response = await sendEmailApi(formData, abortControllerRef.current.signal);
      if (response.success) {
        setSuccess('Your travel inquiry has been sent successfully!');
        setFormData({
          destination: '',
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
          specialRequests: '',
        });
      } else {
        setError(response.error || 'Failed to send inquiry');
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container} aria-label="Travel inquiry form">
      <div className={styles.topContainer}>
        <div className={styles.logoContainer}>
          <img
            src="/static/logo4.png"
            alt="Shivira Travels logo"
            loading="eager"
            width="100"
            height="100"
            className={styles.logo}
          />
        </div>
        <p className={styles.text}>
          By submitting this form, you agree to allow us to contact you via phone or email.
        </p>
      </div>

      <div className={styles.bottomContainer}>
        <div className={styles.grid}>
          <div>
            <p>Where would you like to travel? *</p>
            <Input
              required
              fullWidth
              value={formData.destination}
              onChange={handleInputChange('destination')}
              aria-label="Travel destination"
              sx={{
                cursor: 'pointer',
                '& input': { cursor: 'pointer' },
                '&:focus-within': { cursor: 'text', '& input': { cursor: 'text' } },
                '&:before': { borderBottom: '1px solid black' },
                '&:hover:not(.Mui-disabled):before': { borderBottom: '2px solid black' },
                '&:after': { borderBottom: '2px solid black' },
              }}
            />
          </div>

          <div>
            <p>Your Name *</p>
            <Input
              required
              fullWidth
              value={formData.name}
              onChange={handleInputChange('name')}
              aria-label="Full name"
              sx={{
                cursor: 'pointer',
                '& input': { cursor: 'pointer' },
                '&:focus-within': { cursor: 'text', '& input': { cursor: 'text' } },
                '&:before': { borderBottom: '1px solid black' },
                '&:hover:not(.Mui-disabled):before': { borderBottom: '2px solid black' },
                '&:after': { borderBottom: '2px solid black' },
              }}
            />
          </div>

          <div>
            <p>Your Contact Number *</p>
            <Input
              required
              fullWidth
              type="tel"
              value={formData.contactNumber}
              onChange={handleInputChange('contactNumber')}
              inputProps={{ inputMode: 'tel', pattern: '[0-9+]*' }}
              aria-label="Contact number"
              sx={{
                cursor: 'pointer',
                '& input': { cursor: 'pointer' },
                '&:focus-within': { cursor: 'text', '& input': { cursor: 'text' } },
                '&:before': { borderBottom: '1px solid black' },
                '&:hover:not(.Mui-disabled):before': { borderBottom: '2px solid black' },
                '&:after': { borderBottom: '2px solid black' },
              }}
            />
          </div>

          <div>
            <p>Your Email Address *</p>
            <Input
              required
              type="email"
              fullWidth
              value={formData.email}
              onChange={handleInputChange('email')}
              aria-label="Email address"
              sx={{
                cursor: 'pointer',
                '& input': { cursor: 'pointer' },
                '&:focus-within': { cursor: 'text', '& input': { cursor: 'text' } },
                '&:before': { borderBottom: '1px solid black' },
                '&:hover:not(.Mui-disabled):before': { borderBottom: '2px solid black' },
                '&:after': { borderBottom: '2px solid black' },
              }}
            />
          </div>

          <div>
            <p>When would you like to travel?</p>
            <DatePicker
              className="customDatePicker"
              placeholder=""
              style={{ background: 'transparent', width: '100%' }}
              value={formData.travelDate}
              onChange={handleDateChange}
              aria-label="Travel date"
            />
          </div>

          <div>
            <p>How many days would you like to stay?</p>
            <Input
              fullWidth
              type="number"
              value={formData.stayDays}
              onChange={handleInputChange('stayDays')}
              aria-label="Stay duration"
              sx={{
                cursor: 'pointer',
                '& input': {
                  cursor: 'pointer',
                  '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button': {
                    WebkitAppearance: 'none',
                    margin: 0,
                  },
                  '&[type=number]': { MozAppearance: 'textfield' },
                },
                '&:focus-within': { cursor: 'text', '& input': { cursor: 'text' } },
                '&:before': { borderBottom: '1px solid black' },
                '&:hover:not(.Mui-disabled):before': { borderBottom: '2px solid black' },
                '&:after': { borderBottom: '2px solid black' },
              }}
            />
          </div>

          <div>
            <p>Number of Adults</p>
            <InputNumber
              className="custom-input-number"
              min={1}
              max={15}
              value={formData.adults}
              onChange={handleNumberChange('adults')}
              style={{
                borderRadius: '0px',
                width: '100%',
                background: 'transparent',
                border: 'none',
                borderBottom: '1px solid black',
              }}
              aria-label="Number of adults"
            />
          </div>

          <div>
            <p>Number of Children (2-12 years)</p>
            <InputNumber
              className="custom-input-number"
              min={0}
              max={15}
              value={formData.children}
              onChange={handleNumberChange('children')}
              style={{
                borderRadius: '0px',
                width: '100%',
                background: 'transparent',
                border: 'none',
                borderBottom: '1px solid black',
              }}
              aria-label="Number of children"
            />
          </div>

          <div>
            <p>Number of Infants (0-2 years)</p>
            <InputNumber
              className="custom-input-number"
              min={0}
              max={15}
              value={formData.infants}
              onChange={handleNumberChange('infants')}
              style={{
                borderRadius: '0px',
                width: '100%',
                background: 'transparent',
                border: 'none',
                borderBottom: '1px solid black',
              }}
              aria-label="Number of infants"
            />
          </div>

          <div className={styles.cityField}>
            <p>Which city will you be departing from?</p>
            <Input
              fullWidth
              value={formData.departureCity}
              onChange={handleInputChange('departureCity')}
              aria-label="Departure city"
              sx={{
                cursor: 'pointer',
                '& input': { cursor: 'pointer' },
                '&:focus-within': { cursor: 'text', '& input': { cursor: 'text' } },
                '&:before': { borderBottom: '1px solid black' },
                '&:hover:not(.Mui-disabled):before': { borderBottom: '2px solid black' },
                '&:after': { borderBottom: '2px solid black' },
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
              aria-label="Budget"
              sx={{
                cursor: 'pointer',
                '& input': {
                  cursor: 'pointer',
                  '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button': {
                    WebkitAppearance: 'none',
                    margin: 0,
                  },
                  '&[type=number]': { MozAppearance: 'textfield' },
                },
                '&:focus-within': { cursor: 'text', '& input': { cursor: 'text' } },
                '&:before': { borderBottom: '1px solid black' },
                '&:hover:not(.Mui-disabled):before': { borderBottom: '2px solid black' },
                '&:after': { borderBottom: '2px solid black' },
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
              value={formData.specialRequests}
              onChange={handleInputChange('specialRequests')}
              aria-label="Special requests"
              InputProps={{ disableUnderline: false }}
              sx={{
                '& .MuiInput-underline:before': { borderBottom: '1px solid black' },
                '& .MuiInput-underline:hover:before': { borderBottom: '2px solid black' },
                '& .MuiInput-underline:after': { borderBottom: '2px solid black' },
              }}
            />
          </div>
        </div>

        <div className={styles.buttonContainer}>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={isLoading}
            aria-label="Submit inquiry"
            sx={{ minWidth: 120, display: 'flex', alignItems: 'center', gap: 1 , backgroundColor:'#774e32'}}
          >
            {isLoading ? <CircularProgress size={20} color="inherit" /> : null}
            {isLoading ? 'Sending...' : 'Send Inquiry'}
          </Button>
          <p className={styles.policy}>
            We are committed to safeguarding your privacy. Your personal information
            will be handled with the utmost confidentiality and will not be used for
            commercial purposes without your explicit consent. For more details,
            please review our <a href="/privacy-policy">Privacy Policy</a>.
          </p>
        </div>
      </div>

      <Snackbar
        anchorOrigin={{ vertical, horizontal }}
        open={open || !!error || !!success}
        onClose={handleClose}
        message={error || success || errorQueue[0]}
        key={`${vertical}-${horizontal}-${error || success || errorQueue[0] || ''}`}
        autoHideDuration={6000}
        TransitionComponent={props => <Slide {...props} direction={isMobile ? 'down' : 'up'} />}
        action={
          error && (
            <Button color="inherit" size="small" onClick={handleSubmit} aria-label="Retry submission">
              Retry
            </Button>
          )
        }
        sx={{
          '& .MuiSnackbarContent-root': {
            backgroundColor: error ? '#d32f2f' : success ? '#388e3c' : '#333',
            '& .MuiSnackbarContent-message': { color: 'white', fontFamily: 'monospace' },
          },
          maxWidth: { xs: '80vw', sm: '400px' },
          width: '100%',
          boxSizing: 'border-box',
        }}
      />
    </div>
  );
}