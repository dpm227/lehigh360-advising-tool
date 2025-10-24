import React from 'react';
import HeroSection from './HeroSection';
import AboutSection from './AboutSection';
import StudentHistory from './StudentHistory';
import StudentEmails from './StudentEmails';

const HomePage = ( {authId} ) => {
    return (
      <div>
        <HeroSection />
        <AboutSection />
        <StudentHistory authId={authId} />
        {/*<StudentEmails />*/}
      </div>
    );
  };
  
  export default HomePage;