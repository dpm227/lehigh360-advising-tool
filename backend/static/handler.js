var speechRecognition = window.webkitSpeechRecognition || window.webkitSpeechRecognition
var recognition = new speechRecognition()
var textbox = $("#textbox")
var instructions = $("#instructions")
var transcript = ""
recognition.continuous = true

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";

// recognition is started
$("#start-btn").click(function (event) {
    recognition.start()
    instructions.text("Recording Started")
})
$("#stop-btn").click(function (event) {
    recognition.stop()
    instructions.text("Recording Paused")
})

recognition.onerror = function () {
    instructions.text("Try Again")
}
recognition.onresult = function (event) {
    var current = event.resultIndex;
    var text = event.results[current][0].transcript
    transcript += text + " "
    textbox.val(transcript)
}

textbox.on('input', function () {
    transcript = $(this).val()
})

// -----------> Process Tables - Summary, QnA, and Student Info <----------- //
function fetchStudent() {
    $(document).ready(function () {
        console.log('here')
        // email = $('.data-email').val()
        email = 'aaa013'
        console.log(email)
        $.ajax({
            url: BACKEND_URL + '/recordings/' + email,
            type: "POST",
            success: function (table) {
                // console.log('here');
                // console.log(table);
                // table = JSON.parse(table);
                $(".tbl-qna").html(table["tbl-qna"]);
                $(".tbl-recordings").html(table["tbl-recordings"]);
                $(".tbl-stu-info").html(table["tbl-stu-info"]);
            },
        }); // ajax    
    });
}

function sendEmail(advisor_email, student_email) {
    $.ajax({
        url: "../php/send_email.php",
        type: "POST",
        data: {
            advisor_email,
            student_email,
            type: "send_email",
        },
        success: function (resp) {
            resp = JSON.parse(resp);
            if (resp["data"] == true) {
                $(".info-email").html("Email sent!");
            } else {
                $(".info-email").html("There was an error. Please try again!");
            }
        },
    }); // ajax
}

function addStudent(email, student_name, major, year) {
    $.ajax({
        url: "../php/add_student.php",
        type: "POST",
        data: {
            email,
            student_name,
            major,
            year,
            type: "add_student",
        },
        success: function (table) {
            table = JSON.parse(table);
            $(".tbl-qna").html(table["tbl-qna"]);
            $(".tbl-recordings").html(table["tbl-recordings"]);
            $(".tbl-stu-info").html(table["tbl-stu-info"]);
        },
    }); // ajax
}

// function processTranscript(transcript, email) {
//     $.ajax({
//         url: "../php/process_recording.php",
//         type: "POST",
//         data: {
//             transcript,
//             email,
//         },
//         success: function (table) {
//             table = JSON.parse(table);
//             $(".tbl-qna").html(table["tbl-qna"]);
//             $(".tbl-recordings").html(table["tbl-recordings"]);
//             $(".tbl-stu-info").html(table["tbl-stu-info"]);
//         },
//         error: function () {
//             console.log("error in Ajax recorder.js for transcript.");
//         },
//     });
// }

function createStudentCard(student, url) {
    return `<li class="stud-card">
                <form>
                <ul>
                    <li class="name">Name: ${student.name}</li>
                    <li class="major">${student.major}</li>
                    <li class="year">${student.year}</li>
                    <li class="email">${student.email}@lehigh.edu</li>
                </ul>
                <a href="${url + 'recordings/' + student.email}">See Meeting Details</a>
                </form>
        </li>`;

}

$(document).ready(function () {
    // NOTE: displaying student carbs present in db 
    //base_url = "http://127.0.0.1:8000/"
    //base_url = "https://advising-tool-47b2fa9f438d.herokuapp.com/"
    $.ajax({
        url: BACKEND_URL + "/get_students",
        type: "GET",
        success: function (students) {
            count = 0
            for (const key in students) {
                studentCardHtml = createStudentCard(students[key], BACKEND_URL + "/");
                $('.stud-cards').append(studentCardHtml);
            }
        },
        error: function (e) {
            console.log(e);
        }
    });

    $(".stud-card-form").submit(function (event) {
        event.preventDefault();
        email = $(".email");
        console.log(email)
        $.ajax({
            url: "http://127.0.0.1:8000/recordings",
            url: BACKEND_URL + '/recordings',
            type: "POST",
            data: {
                email,
                type: "search_student",
            },
            success: function (table) {
                table = JSON.parse(table);
                $(".tbl-qna").html(table["tbl-qna"]);
                $(".tbl-recordings").html(table["tbl-recordings"]);
                $(".tbl-stu-info").html(table["tbl-stu-info"]);
            },
        }); // ajax    
    }); // search-stud btn - collect the email to search the db

    $(".search-stud").submit(function (event) {
        event.preventDefault();
        email = $("#search-email").val();
        $.ajax({
            url: BACKEND_URL + '/find_student/' + email,
            type: "GET",
            data: { email },
            success: function (response) {
                console.log(response); 
                if (response == 'True') {
                    $(".finish-meeting-info")
                        .removeClass("error")
                        .addClass("success")
                        .text("✅ Student found! You can start recording.");
                } else {
                    $(".finish-meeting-info")
                        .removeClass("success")
                        .addClass("error")
                        .text("⚠️ Student not found. Try adding them instead.");
                    $("#search-email").val('');
                }
                
            },
        }); // ajax    
    }); // find student 

    $(".finish-meeting-form").submit(function (event) {
        event.preventDefault();
        email = $("#search-email").val();
        $('.finish-meeting-info').html('Meeting Transcript processing. Give it a few minutes.')
        $.ajax({
            url: BACKEND_URL + '/recordings/transcript',
            type: "POST",
            data: { email, transcript },
            success: function (response) {
                console.log(response); 
                if (response) {
                    $(".finish-meeting-info")
                        .removeClass("error")
                        .addClass("success")
                        .text("✅ Transcript recorded successfully. You can safely go back.");
                    $("#textbox").val('');
                } else {
                    $(".finish-meeting-info")
                        .removeClass("success")
                        .addClass("error")
                        .text("❌ Error occurred during transcript processing.");
                }
                                              
            },
        }); // ajax    
    }); // finish meeting submit transcript 


    $(".send-email").submit(function (event) {
        event.preventDefault();
        advisor_email = $("#advisor-email").val();
        student_email = $("#search-email").val();
        if (student_email == "") {
            student_email = $("#email").val();
        }
        $.ajax({
            url: "../php/validation.php",
            type: "POST",
            data: {
                send_email: 1,
                advisor_email,
                student_email,
            },
            success: function (check) {
                // TODO: use check to handle errors 
                // TODO: causing email to be sent twice 
                sendEmail(advisor_email, student_email);
            },
            error: function () {
                $(".info-email").text("Something went wrong while sending the email."); 
            }
        });
    }); // send email summary to student and advisor 

    $(".add-stud").submit(function (event) {
        event.preventDefault();
        email = $("#email").val();
        student_name = $("#name").val();
        major = $("#major").val();
        year = $("#year").val();
        $.ajax({
            url: "../php/validation.php",
            type: "POST",
            data: {
                add_student: 1,
                email,
                student_name,
                major,
                year,
            },
            success: function (check) {
                // TODO: use check to handle errors 
                addStudent(email, student_name, major, year);
            },
            error: function () {
                // 
            }
        });
    }); // add a new student to the db  

    // $("#record-btn").on("click", function () {
    //     $("#instructions").text("Recorded!");
    //     email = $("#search-email").val();
    //     if (email == "") {
    //         email = $("#email").val();
    //     }
    //     $("#textbox").val("");
    //     processTranscript(transcript, email);
    // }); // record-btn - process recordings into tables 
}); 
