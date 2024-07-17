import * as io from "socket.io-client";
import { default as React, useState } from "react";
import MainLayout from "./MainLayout";
import Header from "./Header";
import '../css/Dashboard2.css';

const Dashboard2: React.FC = () => {
    

    return (
        <React.Fragment>
            <div className="dashboard">
                <MainLayout>
                    <div className="boxes">
                        <div className="box">
                            <h2>Test assigned</h2>
                            <p>5</p>
                        </div>
                        <div className="box">
                            <h2>Completed Tests</h2>
                            <p>2</p>
                        </div>
                        <div className="box">
                            <h2>Pending Tests</h2>
                            <p>3</p>
                        </div>
                    </div>
                    <div className="dashboard-table">
                        <table>
                            <thead>
                                <tr>
                                <th>SI#</th>
                                <th>Test Name</th>
                                <th>Status</th>
                                <th>Assigned Date</th>
                                <th>Scores</th>
                                <th>Results</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                <td>1</td>
                                <td>Empathy</td>
                                <td>Upcoming</td>
                                <td>15/12/2022</td>
                                <td>NA</td>
                                <td>Passed</td>
                                </tr>
                                <tr>
                                <td>2</td>
                                <td>Comprehension</td>
                                <td>Pending</td>
                                <td>12/22/2023</td>
                                <td>NA</td>
                                <td>Passed</td>
                                </tr>
                                <tr>
                                <td>3</td>
                                <td>Paraphrasing</td>
                                <td>Completed</td>
                                <td>22/12/2022</td>
                                <td>80%</td>
                                <td>NA</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    
                </MainLayout>
          </div>
        </React.Fragment>
    );
}

export default Dashboard2;