import React from 'react';

const StudentEmails = () => {
    return (
        <section className="student-emails">
            <form className="send-email">
                <h3>Email Meeting Recent Summary</h3>
                <label>Advisor Email</label>
                <input type="text" id="advisor-email"></input>
                <button type="submit">Send Email</button>
                <p className="info-email"></p>
            </form>
        </section>
    );
};

export default StudentEmails;

