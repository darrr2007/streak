// import React, { Component } from "react";
// import "./App.css";
// import logo from './grog.jpg';





// class App extends Component {
//   constructor(props) {
//     super(props);
//     this.state = {
//       apiResponse: "",
//     };
//   }

//   callAPI() {
//     fetch("http://localhost:9000")
//       .then((res) => res.text())
//       .then((res) => this.setState({ apiResponse: res }));
//   }

//   componentDidMount() {
//     this.callAPI();
//   }

//   onFileChange = (e) => {
//     console.log(e.target.files[0]);
//   };

//   fileUpload = () => {
//     if (!this.csvFileInput.files[0]) {
//       alert("Please select a CSV file.");
//       return;
//     }

//     const formData = new FormData();
//     formData.append("file", this.csvFileInput.files[0]);

//     fetch("http://localhost:9000/upload-csv", {
//       method: "POST",
//       body: formData,
//     })
//       .then((response) => response.blob())
//       .then((blob) => {
//         console.log(blob);
//         const url = window.URL.createObjectURL(blob);
//         const a = document.createElement("a");
//         a.href = url;
//         a.download = "generated.zip";
//         a.click();
//         window.URL.revokeObjectURL(url);
//       })
//       .catch((error) => {
//         console.error("Error generating and downloading PDFs:", error);
//       });
//   };

  

//   render() {
//     return (
      
//       <div className="App blue-background">
//         <img src={logo} alt="grog" className="logo"></img>


        
//         <input
//           type="file"
//           ref={(input) => (this.csvFileInput = input)}
//           accept=".csv"  // Only accept CSV files
//           onChange={this.onFileChange}
//         />
//         <button onClick={this.fileUpload}>Generate and Download PDFs</button>

//         <p>{this.state.apiResponse}</p>
//         </div>
      
//     );
//   }
// }




// export default App;






import React, { Component } from "react";
import "./App.css";
import logo from './grog.jpg';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      apiResponse: "",
    };
  }

  callAPI() {
    fetch("http://localhost:443")
      .then((res) => res.text())
      .then((res) => this.setState({ apiResponse: res }));
  }

  componentDidMount() {
    this.callAPI();
  }

  onFileChange = (e) => {
    console.log(e.target.files[0]);
  };

  fileUpload = () => {
    if (!this.csvFileInput.files[0]) {
      alert("Please select a CSV file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", this.csvFileInput.files[0]);

    fetch("http://localhost:443/upload-csv", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.blob())
      .then((blob) => {
        console.log(blob);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "generated.zip";
        a.click();
        window.URL.revokeObjectURL(url);
      })
      .catch((error) => {
        console.error("Error generating and downloading PDFs:", error);
      });
  };

  render() {
    return (
      
      <div className="App blue-background">
        <img src={logo} alt="grog" className="logo" />

        <div className="container">
          <input
            type="file"
            ref={(input) => (this.csvFileInput = input)}
            accept=".csv" // Only accept CSV files
            onChange={this.onFileChange}
          />
          <button onClick={this.fileUpload}>Generate and Download PDFs</button>

          <p>{this.state.apiResponse}</p>
        </div>
      </div>
    );
  }
}

export default App;
