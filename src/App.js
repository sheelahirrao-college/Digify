import React, { Component } from 'react';
import web3 from './web3';
import ipfs from './ipfs';
import storehash from './storehash';
import { Button } from 'reactstrap';
import { Tabs, Tab, Col, Nav, Row } from 'react-bootstrap';
import './styles.css';
import ParticlesBg from 'particles-bg'


class App extends Component {

state = {
      ipfsHash:null,
      buffer:'',
      buffer2:'',
      ethAddress:'',
      transactionHash:'',
      txReceipt: '',
      add_rec:'',
      issuee_data_1: [],
      issuee_data_2: [],
      cert_hash:'',
      str1:'',
      str2:'',
      str3:'',
      str4:'',
      my_acc:''
    };

recipientChange = (event) => {
  this.setState({add_rec: event.target.value});
}
hashChange = (event) => {
  this.setState({cert_hash: event.target.value});
}
//Take file input from user
captureFile =(event) => {
        event.stopPropagation()
        event.preventDefault()
        const file = event.target.files[0]
        let reader = new window.FileReader()
        reader.readAsArrayBuffer(file)
        reader.onloadend = () => this.convertToBuffer(reader)
      };

//Convert the file to buffer to store on IPFS
 convertToBuffer = async(reader) => {
      //file is converted to a buffer for upload to IPFS
        const buffer = await Buffer.from(reader.result);
      //set this buffer-using es6 syntax
        this.setState({buffer});
    };


    captureFile2 =(event) => {
        event.stopPropagation()
        event.preventDefault()
        const file = event.target.files[0]
        let reader = new window.FileReader()
        reader.readAsArrayBuffer(file)
        reader.onloadend = () => this.convertToBuffer2(reader)
      };

//Convert the file to buffer to store on IPFS
 convertToBuffer2 = async(reader) => {
      //file is converted to a buffer for upload to IPFS
        const buffer2 = await Buffer.from(reader.result);
      //set this buffer-using es6 syntax
        this.setState({buffer2});
    };

onClick = async () => {
try{
        this.setState({blockNumber:"waiting.."});
        this.setState({gasUsed:"waiting..."});

await web3.eth.getTransactionReceipt(this.state.transactionHash, (err, txReceipt)=>{
          console.log(err,txReceipt);
          this.setState({txReceipt});
        });
      }
catch(error){
      console.log(error);
    }
}
getHash= async (event) => {
    event.preventDefault();
    const accounts = await web3.eth.getAccounts();
    await ipfs.add(this.state.buffer2, (err, ipfsHash) => {
        console.log(err,ipfsHash);
        const iphash= ipfsHash[0].hash;
        storehash.methods.is_cert_in_blockchain(iphash).call({from: accounts[0]}, (error, boolv) => {
          var iscert = this.refs.ll2;
          if(boolv==true){
            iscert.append("This certificate is in Ethereum Blockchain");
            storehash.methods.get_from_cert(iphash).call({from: accounts[0]}, (error, str) => {
              this.setState({str3:str[0]});
              this.setState({str4:str[1]});
            });
          }
          else{
            iscert.append("This certificate is not in Ethereum Blockchain");
          }
    })
  })    
};

onSubmit = async (event) => {
      event.preventDefault();

//bring in user's metamask account address
      const accounts = await web3.eth.getAccounts();
    //obtain contract address from storehash.js
      const ethAddress= await storehash.options.address;
      this.setState({ethAddress});
    //save document to IPFS,return its hash#, and set hash# to state
      await ipfs.add(this.state.buffer, (err, ipfsHash) => {
        console.log(err,ipfsHash);
        //setState by setting ipfsHash to ipfsHash[0].hash
        this.setState({ ipfsHash:ipfsHash[0].hash });
        storehash.methods.issue_cert(this.state.add_rec,this.state.ipfsHash).send({
          from: accounts[0]
        }, (error, transactionHash) => {
          console.log(transactionHash);
          this.setState({transactionHash});
        });
      })
    };
    show_acc= async (event) =>{
      const accounts = await web3.eth.getAccounts();
      this.setState({my_acc:accounts[0]});
    }
    show_cert_2 = async (event) => {
      const accounts = await web3.eth.getAccounts();
      storehash.methods.issuee_cert_cnt(accounts[0]).call({from: accounts[0]},(error, result) => {
        const len = parseInt(result);
        for(let i =0;i<len;i++){
          var i_data1=[];
          var i_data2=[];
        storehash.methods.get_cert_issuee(i).call({from: accounts[0]}, (error, ans) => {
          i_data1.push(ans[0]);
          i_data2.push(ans[1]);

          var cert_table = this.refs.cert_table_1;
          cert_table.append("ISSUER : "+ans[0]+" CERTIFICATE_HASH : "+ans[1]+" ______________________________________________________________________________ CERTIFICATE_LINK : gateway.ipfs.io/ipfs/"+ans[1]+" _______________________________________________________________________________________________________________________________ ");
        // console.log(i_data1[0]);
          // console.log(i_data2[0]);
        })
        // console.log(i_data1);
        this.setState({issuee_data_1:i_data1});
        this.state.issuee_data_1.map(item=>(console.log(item)));
        // console.log(x[0]);
        this.setState({issuee_data_2:i_data2});

        var cert_table = this.refs.cert_table_1;
        cert_table.append("");
      }
      });

  };

  show_cert_3 = async (event) => {
    const accounts = await web3.eth.getAccounts();
    storehash.methods.issuer_cert_cnt(accounts[0]).call({from: accounts[0]},(error, result) => {
      const len = parseInt(result);
      for(let i =0;i<len;i++){
        var i_data1=[];
        var i_data2=[];
      storehash.methods.get_cert_issuer(i).call({from: accounts[0]}, (error, ans) => {
        i_data1.push(ans[0]);
        i_data2.push(ans[1]);

        var cert_table = this.refs.cert_table_2;
        cert_table.append("RECIPIENT : "+ans[0]+" CERTIFICATE_HASH : "+ans[1]+" ______________________________________________________________________________ CERTIFICATE_LINK : gateway.ipfs.io/ipfs/"+ans[1]+" _______________________________________________________________________________________________________________________________ ");
        // console.log(i_data1[0]);
        // console.log(i_data2[0]);
      })

      var cert_table = this.refs.cert_table_2;
      cert_table.append("");
    }
    });

};
  
  onVerify = async (event) => {
    event.preventDefault();

    const accounts = await web3.eth.getAccounts();
    storehash.methods.is_cert_in_blockchain(this.state.cert_hash).call({from: accounts[0]}, (error, boolv) => {
      var iscert = this.refs.ll;
      if(boolv==true){
        iscert.append("This certificate is in Ethereum Blockchain");
        storehash.methods.get_from_cert(this.state.cert_hash).call({from: accounts[0]}, (error, str) => {
          this.setState({str1:str[0]});
          this.setState({str2:str[1]});
        });
      }
      else{
        iscert.append("This certificate is not in Ethereum Blockchain");
      }

    });
  };

render() {
  return (
          <div className="App">
            {/* <ParticlesBg type="cobweb" bg={true} /> */}
            <header className="App-header">
                  <h1 className="project_title">Digify</h1>
                  {/* <h3 className="project_subtitle">Blockchain Based Certification</h3> */}
            </header> 
            <center>
              <Tab.Container id="left-tabs-example" defaultActiveKey="first">
                <Row>
                  <Col sm={6}>
                    <Nav variant="pills" className="flex-column">
                      <Nav.Item>
                        <Nav.Link eventKey="first">Account</Nav.Link>
                      </Nav.Item>
                      <Nav.Item>
                        <Nav.Link eventKey="second">Send File</Nav.Link>
                      </Nav.Item>
                      <Nav.Item>
                        <Nav.Link eventKey="third">My Issued Certificates</Nav.Link>
                      </Nav.Item>
                      <Nav.Item>
                        <Nav.Link eventKey="fourth">Certificates Issued To Me</Nav.Link>
                      </Nav.Item>
                      <Nav.Item>
                        <Nav.Link eventKey="fifth">Verify Certificate</Nav.Link>
                      </Nav.Item>
                      <Nav.Item>
                        <Nav.Link eventKey="sixth">Search Certificate</Nav.Link>
                      </Nav.Item>
                    </Nav>
                  </Col>
                  <Col sm={6}>
                    <Tab.Content>
                      <Tab.Pane eventKey="first">
                        <div>
                          <hr/>
                          <h1>Your Account:</h1> 
                          <h4>{this.state.my_acc}</h4> 
                          <Button onClick = {this.show_acc}> Show Account </Button>
                        </div>
                      </Tab.Pane>
                      <Tab.Pane eventKey="second">
                        <grid>
                          <hr/>
                          <h3> Choose file to send to IPFS </h3>
                            <form onSubmit={this.onSubmit}>
                              <label>Recipient address:
                                <input
                                  type = "text" id="add_rec" onChange = {this.recipientChange}
                                />
                              </label>
                              <br></br>
                              <input
                                type = "file"
                                onChange = {this.captureFile}
                              />
                              <Button
                                bsStyle="primary"
                                type="submit">
                                Send it
                              </Button>
                            </form>
                            <hr/>
                            <table bordered responsive>
                              <thead>
                                <tr>
                                  <th>Tx Receipt Category</th>
                                  <th> </th>
                                  <th>Values</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                                  <td>IPFS Hash stored on Ethereum</td>
                                  <td> : </td>
                                  <td>{this.state.ipfsHash}</td>
                                </tr>
                                <tr>
                                  <td>Ethereum Contract Address</td>
                                  <td> : </td>
                                  <td>{this.state.ethAddress}</td>
                                </tr>
                                <tr>
                                  <td>Tx # </td>
                                  <td> : </td>
                                  <td>{this.state.transactionHash}</td>
                                </tr>
                              </tbody>
                          </table>
                        </grid>
                      </Tab.Pane>
                      <Tab.Pane eventKey="third">
                        <div>
                          <hr/>
                          <h1>My Issued certificates: </h1>
                          <br/>
                          <p id="accountAddress"></p><br/>
                            <Button onClick = {this.show_cert_3}> Show Certificate </Button>
                            <table ref="cert_table_2">
                            </table>     
                        </div>
                      </Tab.Pane>
                      <Tab.Pane eventKey="fourth">
                        <div>
                          <hr/>
                          <h1>Certificates issued to me: </h1>
                          <br/>
                          <p id="accountAddress"></p><br/>
                            <Button onClick = {this.show_cert_2}> Show Certificate </Button>
                            <table ref="cert_table_1">
                            </table>
                        </div>
                      </Tab.Pane>
                      <Tab.Pane eventKey="fifth">
                        <div>
                          <hr/>
                          <h3> Verify Certificate</h3>
                          <h4>Search By Certificate Hash :</h4>
                          <form onSubmit={this.onVerify}>
                            <label>Enter Certificate hash:
                              <input
                                type = "text" id="input" onChange = {this.hashChange}
                              />
                            </label>
                            <br></br>
                            <Button
                              bsStyle="primary"
                              type="submit">
                              Verify it
                            </Button>
                          </form>
                          <p ref="ll"></p>

                          <p>Issuer Address - {this.state.str1}</p>
                          <br/>
                          <p>Recipient Address - {this.state.str2}</p>
                            <br/>
                        </div>
                      </Tab.Pane>
                      <Tab.Pane eventKey="sixth">
                        <hr/>
                        <h4>Search By Certificate :</h4>
                        <form onSubmit={this.getHash}>
                          <br></br>
                          <input
                            type = "file"
                            onChange = {this.captureFile2}
                          />
                          <br/><br/>
                          <Button
                            bsStyle="primary"
                            type="submit">
                            Verify it
                          </Button>
                        </form>
                        <p ref="ll2"></p>
                        <p>Issuer Address - {this.state.str3}</p>
                        <br/>
                        <p>Recipient Address - {this.state.str4}</p>
                      </Tab.Pane>
                    </Tab.Content>
                  </Col>
                </Row>
              </Tab.Container>
              </center>
        </div>
      );
    }
}

export default App;
