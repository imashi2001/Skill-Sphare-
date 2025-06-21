import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Helper to ensure seconds in datetime-local string
function ensureSeconds(dateTimeLocalStr) {
  if (!dateTimeLocalStr) return '';
  // If already has seconds, return as is
  if (dateTimeLocalStr.length === 19) return dateTimeLocalStr;
  // If input is like '2025-05-10T09:00', add ':00'
  if (dateTimeLocalStr.length === 16) return dateTimeLocalStr + ':00';
  return dateTimeLocalStr; // fallback
}

function TaskCorner() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    topics: [],
    resources: [],
    startDate: '',
    endDate: ''
  });
  const [editingTask, setEditingTask] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTasks = async () => {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      if (!token || !userId) {
        console.error("User is not authenticated or userId is missing.");
        return;
      }

      try {
        const response = await axios.get(`/api/tasks/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Ensure the response data is an array
        if (Array.isArray(response.data)) {
          setTasks(response.data);
        } else {
          console.error("Unexpected response format:", response.data);
          setTasks([]); // Fallback to an empty array
        }
      } catch (error) {
        console.error("Error fetching tasks:", error);
        setTasks([]); // Fallback to an empty array in case of error
      }
    };

    fetchTasks();
  }, []);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    if (!token) {
        console.error("User is not authenticated.");
        return;
    }

    // Ensure topics and resources are arrays
    const formattedTask = {
        ...newTask,
        topics: Array.isArray(newTask.topics) ? newTask.topics : newTask.topics.split(",").map((t) => t.trim()),
        resources: Array.isArray(newTask.resources) ? newTask.resources : newTask.resources.split(",").map((r) => r.trim()),
    };

    try {
        const response = await axios.post(
            "/api/tasks",
            formattedTask,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        setTasks([...tasks, response.data]);
        setNewTask({
            title: "",
            description: "",
            topics: [],
            resources: [],
            startDate: "",
            endDate: "",
        });
    } catch (error) {
        console.error("Error creating task:", error);
    }
};

const handleUpdateTask = async (taskId, updatedTask) => {
    const token = localStorage.getItem("token");

    if (!token) {
        console.error("User is not authenticated.");
        return;
    }

    try {
        const response = await axios.put(
            `/api/tasks/${taskId}`,
            updatedTask,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        setTasks(tasks.map((task) => (task.id === taskId ? response.data : task)));
    } catch (error) {
        console.error("Error updating task:", error);
    }
};

const handleDeleteTask = async (taskId) => {
    const token = localStorage.getItem("token");

    if (!token) {
        console.error("User is not authenticated.");
        return;
    }

    try {
        await axios.delete(`/api/tasks/${taskId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        setTasks(tasks.filter((task) => task.id !== taskId));
    } catch (error) {
        console.error("Error deleting task:", error);
    }
};

  // Handles both create and edit input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (editingTask) {
      setEditingTask({ ...editingTask, [name]: value });
    } else {
      setNewTask({ ...newTask, [name]: value });
    }
  };

  // Handles topics/resources as comma-separated input
  const handleArrayInputChange = (e, field) => {
    const value = e.target.value;
    if (editingTask) {
      setEditingTask({ ...editingTask, [field]: value });
    } else {
      setNewTask({ ...newTask, [field]: value });
    }
  };

  // Helper to display array fields as comma-separated string in input
  const arrayToString = (arr) => Array.isArray(arr) ? arr.join(', ') : (arr || '');

  // Helper to convert backend ISO string to input value (without seconds)
  const toInputDateTime = (isoString) => {
    if (!isoString) return '';
    // Remove seconds for display in input
    return isoString.slice(0, 16);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Task Corner</h1>
      
      {/* Create/Edit Task Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">
          {editingTask ? 'Edit Task' : 'Create New Task'}
        </h2>
        <form onSubmit={editingTask ? handleUpdateTask : handleCreateTask}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                name="title"
                value={editingTask ? editingTask.title : newTask.title}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                value={editingTask ? editingTask.description : newTask.description}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Topics (comma-separated)</label>
              <input
                type="text"
                value={editingTask ? arrayToString(editingTask.topics) : arrayToString(newTask.topics)}
                onChange={(e) => handleArrayInputChange(e, 'topics')}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Resources (comma-separated)</label>
              <input
                type="text"
                value={editingTask ? arrayToString(editingTask.resources) : arrayToString(newTask.resources)}
                onChange={(e) => handleArrayInputChange(e, 'resources')}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="datetime-local"
                name="startDate"
                value={editingTask ? toInputDateTime(editingTask.startDate) : toInputDateTime(newTask.startDate)}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="datetime-local"
                name="endDate"
                value={editingTask ? toInputDateTime(editingTask.endDate) : toInputDateTime(newTask.endDate)}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>
          </div>
          <div className="flex justify-end">
            {editingTask && (
              <button
                type="button"
                onClick={() => setEditingTask(null)}
                className="mr-2 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              {editingTask ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>

      {/* Tasks List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tasks.map((task) => (
          <div key={task.id} className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-2">{task.title}</h3>
            <p className="text-gray-600 mb-4">{task.description}</p>
            
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

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditingTask(task)}
                className="px-3 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 text-sm"
              >
                Edit
              </button>
              <button
                onClick={() => handleDeleteTask(task.id)}
                className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm"
              >
                Delete
              </button>
              <button
                onClick={() => navigate(`/tasks/${task.id}`)}
                className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
              >
                View
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TaskCorner;
