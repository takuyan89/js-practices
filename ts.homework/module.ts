import { format } from "date-fns";

function displayCurrentTime() {
    const now = new Date();
    const formattedTime = format(now, "yyyy-MM-dd HH:mm:ss");
    console.log(formattedTime);
}

setInterval(displayCurrentTime, 1000);
