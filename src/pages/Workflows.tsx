import {useState, useEffect} from 'react';

export const Workflows = () => {
    // const [rawData, setRawData] = useState<string>('');
    const [deadlines, setDeadlines] = useState<{ project_title: string; deadline: string }[]>([]);

    useEffect(() => {
        fetch("https://intelligentdms.onrender.com/api/workflow_news")
            .then(response => response.text())
            .then(text => {
                console.log("Raw response text:", text);

                // Extract project titles and deadlines using regex
                const matches = [...text.matchAll(/"project_title":\s*"([^"]+)"\s*,\s*"deadline":\s*"([^"]+)"/g)];

                // Convert matches into an array of objects
                const projectData = matches.map(match => ({
                    project_title: match[1],
                    deadline: match[2]
                }));

                setDeadlines(projectData);
            })
            .catch(error => console.error("Error fetching workflows:", error));
    }, []);

    return (
        <div>
            {/*<h2>Raw Workflow Data</h2>*/}
            {
                deadlines.map((data) => {
                    return (
                        <div className="workflow-card m-2 p-2 ">
                            <h2>{data.project_title}</h2>
                            <p>{data.deadline}</p>
                        </div>
                    )
                })
            }
        </div>
    );
};
