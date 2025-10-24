function botSpeak(text) {
    var speak_output = text;
    var speak_output_html = '<div class="bot-inbox inbox"><div class="icon"><i class="fas fa-user"></i></div><div class="msg-header"><p>' + speak_output + '</p></div></div>';
    $(".conversation").append(speak_output_html);
    $(".conversation").scrollTop($(".conversation")[0].scrollHeight);
}

function userSpeak(cls) {
    let userText = $(cls).val();
    let html = '<div class="user-inbox inbox"><div class="msg-header"> <p>' + userText + '</p><div></div>';
    $(".conversation").append(html);
    $(".conversation").scrollTop($(".conversation")[0].scrollHeight);
    return userText;
}

$(document).ready(function () {
    let program;
    $("#program-select-btn").on("click", function () {
        program = $("#programs").val(); // TODO: find a way to handler globals better 
        let messageHTML = '<div class="user-inbox inbox"><div class="msg-header"> <p>' + program + '</p><div></div>';
        $(".conversation").append(messageHTML);

        $.ajax({
            url: "../php/program_info.php",
            type: "POST",
            data: {
                program
            },
            success: function (programInfo) {
                // console.log(programInfo);
                $(".program-details").html(programInfo);
                botSpeak("What questions to you have for " + program + " ?")
            },
            error: function () {
                botSpeak("Server Error!");
            },
        }); // ajax
    }); // on click - program-select-btn

    $("#user-text-btn").on("click", function () {
        let question = userSpeak("#user-text");
        $("#user-text").val("");

        $.ajax({
            url: "../php/find_answer.php",
            type: "POST",
            data: {
                program,
                question
            },
            success: function (answer) {
                botSpeak(answer);
            },// success - answer 
            error: function () {
                botSpeak("Error in user-text-btn")
            } // error - answer 
        }); // ajax 
    }); // on click - user-text-btn
}); // doc ready 