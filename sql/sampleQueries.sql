-- Common Queries for our app

SELECT * 
FROM Student, Post
WHERE Post.author = Student.studentID AND Student.studentID = X; -- X is current user's id

SELECT Post.*, Student.username
FROM Community, Post, Student
WHERE Post.author = Student.studentID AND Post.communityID = Community.communityID AND Community.communityID = X; -- X is selected community's id

SELECT *
FROM Reply
WHERE Reply.postID = X; -- X is gotten earlier, id of currently selected post