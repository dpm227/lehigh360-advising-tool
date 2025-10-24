function fetchStudent(api_data) {
    const table_data = {
        "tbl-stu-info": "",
        "tbl-qna": "",
        "tbl-recordings": "",
    };
    let tbl_stu_info = `
<thead>
<tr>
<th>Student Email</th>
<th>Student Name</th>
<th>Year</th>
<th>Major</th>
</tr>
</thead>
<tbody>
<tr>
<td>${api_data.info.email}</td>
<td>${api_data.info.name}</td>
<td>${api_data.info.year}</td>
<td>${api_data.info.major}</td>
</tr>
</tbody>`;
    table_data["tbl-stu-info"] = tbl_stu_info;

    // Table for Summaries of all meetings: tbl-recordings
    let tbl_recordings = `
<thead>
<tr>
<th>Number</th>
<th>Meeting Date and Time</th>
<th>Program</th>
<th>Meeting Summary</th>
</tr>
</thead>
<tbody>`;
    for (const recording of api_data.recordings) {
        tbl_recordings += `
<tr>
<td>${recording[0]}</td>
<td>${recording[1]}</td>
<td>${recording[2]}</td>
<td>${recording[3]}</td>
</tr>`;
    }
    tbl_recordings += `</tbody>`;
    table_data["tbl-recordings"] = tbl_recordings;

    // Table for QnA information: tbl-qna
    let tbl_qna = `
<thead>
<tr>
<th>Number</th>
<th>Questions Raised</th>
<th>Answers Provided</th>
</tr>
</thead>
<tbody>`;
    for (let i = 0; i < api_data.recordings.length; i++) {
        tbl_qna += `
<tr>
<td>${i + 1}</td>
<td>${api_data.recordings[i][4]}</td>
<td>${api_data.recordings[i][5]}</td>
</tr>`;
    }
    tbl_qna += `</tbody>`;
    table_data["tbl-qna"] = tbl_qna;

    // Convert the table data to JSON and log it
    return table_data; 
}

$(document).ready(function () {
    let email = $('.data-email')[0].innerHTML.trim().replace("\'", "").replace("\'", "")
    // console.log(email)
    const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";

    //base_url = "https://advising-tool-47b2fa9f438d.herokuapp.com/"
    $.ajax({
        url: BACKEND_URL + "recordings/" + email,
        type: "POST",
        success: function (api_data) {
            console.log(api_data);
            $(".tbl-qna").html(api_data['questions_answers']);
            $(".tbl-recordings").html(api_data['summary']);
            $(".tbl-stu-info").html(api_data['student_info']);
        },
    }); // ajax    
});