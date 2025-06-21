import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import html2canvas from 'html2canvas';

function TaskView() {
  const { taskId } = useParams();
  const [task, setTask] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTask = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        console.error("User is not authenticated.");
        return;
      }

      try {
        const response = await axios.get(`/api/tasks/${taskId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setTask(response.data);
      } catch (error) {
        console.error("Error fetching task details:", error);
      }
    };

    fetchTask();
  }, [taskId]);

  const handleCopyLink = () => {
    const taskUrl = `${window.location.origin}/tasks/${taskId}`;
    navigator.clipboard.writeText(taskUrl).then(() => {
      alert("Task link copied to clipboard!");
      navigate("/posts");
    }).catch((err) => {
      console.error("Failed to copy task link:", err);
    });
  };

  const handleShareAsPicture = async () => {
    const taskElement = document.getElementById('task-details');
    if (!taskElement) {
      console.error('Task details element not found.');
      return;
    }

    try {
      const canvas = await html2canvas(taskElement);
      canvas.toBlob((blob) => {
        if (blob) {
          const item = new ClipboardItem({ 'image/png': blob });
          navigator.clipboard.write([item]).then(() => {
            alert('Task details copied as an image to clipboard!');
            navigate('/posts');
          }).catch((err) => {
            console.error('Failed to copy image to clipboard:', err);
          });
        }
      });
    } catch (error) {
      console.error('Error capturing task details as an image:', error);
    }
  };

  const handleShareAsPost = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("User is not authenticated.");
      return;
    }

    try {
      const postData = {
        title: `Task: ${task.title}`,
        content: `Task Description: ${task.description}\n\nTopics: ${task.topics.join(', ')}\n\nResources:\n${task.resources.join('\n')}\n\nStart Date: ${new Date(task.startDate).toLocaleString()}\nEnd Date: ${new Date(task.endDate).toLocaleString()}`,
        category: 'Education'
      };

      await axios.post('http://localhost:8080/api/posts', postData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      alert("Task shared as post successfully!");
      navigate("/posts");
    } catch (error) {
      console.error("Error sharing task as post:", error);
      alert("Failed to share task as post. Please try again.");
    }
  };

  if (!task) {
    return <div>Loading task details...</div>;
  }

  return (
    <div id="task-details" className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">{task.title}</h1>
      <p className="text-gray-700 mb-4">{task.description}</p>

      <div className="mb-4">
        <h4 className="font-medium mb-1">Topics:</h4>
        <div className="flex flex-wrap gap-2">
          {task.topics && task.topics.map((topic, index) => (
            <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
              {topic}
            </span>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <h4 className="font-medium mb-1">Resources:</h4>
        <ul className="list-disc list-inside">
          {task.resources && task.resources.map((resource, index) => (
            <li key={index} className="text-sm text-gray-600">{resource}</li>
          ))}
        </ul>
      </div>

      <div className="text-sm text-gray-500 mb-4">
        <p>Start: {new Date(task.startDate).toLocaleString()}</p>
        <p>End: {new Date(task.endDate).toLocaleString()}</p>
      </div>

      <div className="flex gap-4">
        <button
          onClick={handleCopyLink}
          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
        >
          Share Task
        </button>

        <button
          onClick={handleShareAsPicture}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Share as Picture
        </button>

        <button
          onClick={handleShareAsPost}
          className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600"
        >
          Share as Post
        </button>
      </div>
    </div>
  );
}

export default TaskView;
