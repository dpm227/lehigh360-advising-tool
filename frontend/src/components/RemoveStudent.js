import React from 'react';
import StudentRemoveList from './StudentRemoveList.js'
import GoBack from './GoBack.js';


const RemoveStudent = ( {authId} ) => {
    return (
        <div className="record-body">
            <div className="record_meeting">
                <GoBack />
                <section className="new-recording">
                    <div className="add-stud-section">
                        <h1>Choose a Student to remove</h1>
                        <StudentRemoveList authId={authId}/>
                    </div>
                </section>
            </div >
        </div >
    );
};

export default RemoveStudent;

