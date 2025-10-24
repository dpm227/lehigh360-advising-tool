<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Questioning EchoHawks</title>

    <link rel="stylesheet" href="../css/questioner.css">
    <script src="https://code.jquery.com/jquery-3.7.1.min.js"
        integrity="sha256-/JqT3SQfawRcv/BIHPThkBvs0OEvtFFmqPF/lYI/Cxo=" crossorigin="anonymous"></script>
    <script src="https://kit.fontawesome.com/6b7c864196.js" crossorigin="anonymous"></script>
    <link rel="icon" href="../css/LU logo.png" type="image/x-icon">
    <script src="../js/handler_questioner.js"></script>
</head>

<body class="site">
    <section class="header">
        <h1>Ask a Question</h1>
    </section>
    <section class="program-select">
        <h2>Select a Program</h2>
        <select id="programs">
            <option value="">Select a Program</option>
            <?php 
            // $program_names = file_get_contents("http://127.0.0.1:8000/program_names");
            $program_names = file_get_contents("https://echohawks-chat-api-b2592693cdf1.herokuapp.com/program_names");
            $program_names = json_decode($program_names, true);
            foreach ($program_names as $key => $names) {
                foreach ($names as $name) {
                    $html = "<option value='$name'>$name</option>"; 
                    echo $html; 
                }
            }
            ?>
            <option value="Break the Silence Peer Educators">Break the Silence Peer Educators</option>
        </select>
        <button type="submit" id="program-select-btn">Submit</button>
    </section>
    <section class="program-info">
        <h2>Here is the Program Info</h2>
        <div class="program-details">
            <h3>Campus Sustainable Impact Fellowship</h3>
            <p>Campus Sustainable Impact Fellows are a cohort of undergraduate and graduate students who address
                challenges
                related to the UN Sustainable Development Goals on Lehigh's campus. CSIFs advance their projects in the
                Spring and Fall semesters and have the option of working on their project in the summer at Mountaintop.
                The
                courses, workshops, retreats, and immersive experiences of this program integrate experiential learning,
                research, and entrepreneurial engagement with students leading original and ambitious projects with
                partners
                on campus and across the region. Projects are mentored by Lehigh faculty with students making
                substantial
                intellectual contributions along the way.<br>

                <br>Website:
                https://creativeinquiry.lehigh.edu/mountaintop-programs/campus-sustainable-impact-fellowship

                <br><br>Contact: Bill Whitney, wrw210@lehigh.edu

                <br><br>Timeline: Application deadline is 11:59pm ET on Sunday, October 29th. Two semesters (Spring
                followed
                by
                Fall). 3 Academic Credits per semester for two semesters.

                <br><br>Cost/Funding: No cost to students
            </p>
        </div>
    </section>
    <section class="chat">
        <h2>EchoHawks Chat</h2>
        <div class="conversation">
            <div class="bot-inbox inbox">
                <div class="icon">
                    <i class="fas fa-user"></i>
                </div>
                <div class="msg-header">
                    <p>Hello there, how can I help?</p>
                </div>
            </div>
        </div>
        <form class="typing-field">
            <div class="input-data">
                <input id="user-text" type="text" placeholder="Type Something" required>
                <button id="user-text-btn">Send</button>
            </div>
        </form>
    </section>

    <section class="action">
        <form action="recorder.html">
            <button>Record a Meeting</button>
        </form>
    </section>
</body>

</html>