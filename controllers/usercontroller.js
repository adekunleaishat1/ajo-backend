const usermodel = require("../models/usermodel");
const notificationmodel = require("../models/notificationmodel");
const transactionmodel = require("../models/transactionmodel");
const { cloudinary } = require("../utils/cloudinary");
const contributionmodel = require("../models/contributionmodel");
const tokenmodel = require("../models/tokenmodel");
const { generateToken, verifyToken } = require("../services/sessionservices");
const bcryptjs = require("bcryptjs");
const paystackSecret = process.env.PAYSTACK_SECRET;
const paystack = require("paystack");
const axios = require("axios");
const { generateCode } = require("../utils/generator");
const { forgotpasswordmail } = require("../utils/mailer");
const { assign } = require("nodemailer/lib/shared");
const e = require("cors");
const cron = require('node-cron')


const signup = async (req, res, next) => {
  try {
    const { username, email, password, bvn } = req.body;
    if (username === "" || email === "" || password === "" || bvn === "") {
      return res.status(400).send({
        message: "username, email, password or bvn must not be empty",
        status: false,
      });
    }
    const existingdetails = await usermodel.findOne({
      $or: [
        {
          email,
          username,
        },
      ],
    });
    if (existingdetails) {
      return res.status(409).send({
        message: "email or username is already in use",
        status: false,
      });
    }
    const result = await usermodel.create({ username, email, password, bvn });
    if (!result) {
      return res.status(500).send({
        message: "Error creating your acount ,try again ",
        status: false,
      });
    }
    return res
      .status(201)
      .send({ message: "Account created successfully", status: true });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const contributor_signup = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const email = verifyToken(token);
    const { contributionname, amount, interest, plan, nopeople, image } =
      req.body;
    console.log(req.body, 35);
    if (
      contributionname === "" ||
      amount === "" ||
      interest === "" ||
      plan === "" ||
      nopeople === "" ||
      image === ""
    ) {
      return res
        .status(400)
        .send({ message: "Input field cannot be empty", status: false });
    }
    const existingcontribution = await contributionmodel.findOne({
      contributionname: contributionname,
    });
    if (existingcontribution) {
      return res.status(404).send({
        message: "Account already existed, try creating another one",
        status: false,
      });
    }
    const newimage = await cloudinary.uploader.upload(image);

    const user = await usermodel.findOne({ email });
    if (!user) {
      return res.status(404).send({ message: "User not found", status: false });
    }
    const newAdmin = user.username;
    const newcontribution = await contributionmodel.create({
      contributionname,
      amount,
      interest,
      plan,
      nopeople,
      image: newimage.secure_url,
      admin: email,
      peopleJoined: 1,
      members: [
        {
          username: newAdmin,
          amount: 0,
        },
      ],
    });
    if (!newcontribution) {
      return res.status(409).send({
        message: "Error creating contribution , try again",
        status: false,
      });
    }
    const result = await contributionmodel.updateOne(
      { email },
      { $push: { members: { username: newAdmin, amount: 0 } } }
    );
    const contributionLink = `http://localhost:3000/dashboard/group/onegroup/${newcontribution._id}`;

    return res.status(202).send({
      message: "Contribution created successfully",
      status: true,
      contributionLink, 
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const getContribution = async (req, res, next) => {
  const contributionId = req.params.id;
  try {
    const contribution = await contributionmodel.findById({
      _id: contributionId,
    });
    if (!contribution) {
      return res
        .status(404)
        .send({ message: "Contribution not found", status: false });
    }
    return res
      .status(200)
      .send({ message: "contribution fetched successfully", contribution });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const getallContribution = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    console.log(token);
    const email = verifyToken(token);
    const checkUser = await usermodel.findOne({email});

    if (!token) {
         res.status(401).send({ message: "No token provided", status: false,  });

    }else if(!email){

      res.status(402).send({  message: "Invalid token",status: false,  });
    }else{
      const Allcontribution = await contributionmodel.find(
        {"members": {
          $elemMatch: { "username": checkUser.username }
        }
        });
      console.log(Allcontribution);
      if (Allcontribution.length === 0) {
        return res.status(405).send({ message: "No contribution found", status: false });
      }

      return res.status(200).send({ message: "contribution fetched successfully",Allcontribution,status: true, });
    }
   
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const signin = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    if (email === "" || password === "") {
      return res
        .status(400)
        .send({ message: "email or password cannot be empty", status: false });
    }
    const result = await usermodel.findOne({
      $or: [{ email: email }, { username: username }],
    });
    if (!result) {
      return res.status(404).send({
        message: "Account does not exist, try creating one",
        status: false,
      });
    }
    const compare = await bcryptjs.compare(password, result.password);
    console.log(password);
    if (!compare) {
      return res
        .status(409)
        .send({ message: "Invalid password", status: false });
    }
    const email2 = result.email;
    const token = generateToken(email2);
    return res
      .status(200)
      .send({ message: `welcome ${result.username}`, status: true, token });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
const verifyuserToken = async (req, res, next) => {
  try {
    const auth = req.headers.authorization;
    const token = auth.split(" ")[1];

    if (!token) {
      return res
        .status(401)
        .send({ messsage: "Unauthorized", status: "false" });
    }
    const userEmail = verifyToken(token);
    console.log(userEmail);
    const checkUser = await usermodel.findOne({ email: userEmail });
    if (!checkUser) {
      return res.status(402).send({ message: "unauthorized", status: false });
    } else {
      const { wallet, username, email } = checkUser;
      console.log(wallet, username, email);
      return res.status(200).send({ username, email, wallet, status: true });
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
};
const verifythriftLink = async (req, res, next) => {
    try {
      const token = req.headers.authorization.split(" ")[1]
      const useremail = verifyToken(token)

      const checkUser = await usermodel.findOne({ email: useremail });

      if (!checkUser) {

        return res.status(402).send({ message: "unauthorized", status: false });
      }else{
        const contributionid = req.params.id;
        const contribution = await contributionmodel.findOne({

          _id: contributionid,
        });
        const member = await contributionmodel.findOne({
          "members": {
            $elemMatch: {
              "username": checkUser.username
            }
          }
        })
        if (!contribution) {
          return res
            .status(402)
            .send({ message: "The link is not valid", status: false });
        }
       else if (contribution.peopleJoined >= contribution.nopeople) {
          return res.status(403).send({
            message: "Thrift is full, the link is no longer valid",
            status: false,
          });
        } else if(member) {

          return res.status(404).send({message: "User already exist in the thrift", status: false})

        }else{
          contribution.members.push({ username: checkUser.username, amount: 0 });
          contribution.peopleJoined++;
          await contribution.save();
    
          return res .status(200) .send({ messsage: "Token verified successfully", status: true , });
        }  
      }
     
    } catch (error) {
      console.log(error);
      next(error);
    }
  };

  const initializepayment = async (req, res, next)=>{
    const {amount, email, name} = req.body
    const token = req.headers.authorization?.split(" ")[1];
    const useremail = verifyToken(token);
    try {
      const initializeresponse = await axios.post('https://api.paystack.co/transaction/initialize',{
      email: email,
      amount: amount,
      name: name
    },
      {
        headers: {
          authorization: `Bearer ${paystackSecret}`,
          "content-type": "application/json",
          "cache-control": "no control",
        },
      }
      )
      if(!initializeresponse.data.status){
        return res.status(401).send({message:"authurization failed",status:false})
      }
      return res.status(200).send({message:"authorization successful",status:true, data:initializeresponse.data.data})

    } catch (error) {
      console.log(error);
      next(error)
    }
  }

const payment = async (req, res, next) => {
  const { reference} = req.body;
  const token = req.headers.authorization?.split(" ")[1];
  const email = verifyToken(token);
  try {
    if (reference === "") {
      return res.status(404).send({message:"reference is required", status: false})
    }
    const paymentResponse = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          authorization: `Bearer ${paystackSecret}`,
          "content-type": "application/json",
          "cache-control": "no control",
        },
      }
    );

    console.log(paymentResponse.data, "line 331");

    if ( paymentResponse.data.data.status !== "success") 
      {
      return res.status(402).send({
        message: "oops , Payment not completed ",
        status: false,
      });
    }
    const user = await usermodel.findOne({ email });
    console.log(user, "User on line 299");
    if (!user) {
      return res.status(404).send({ message: "User not found", status: false });
    }
    const transaction = await transactionmodel.create({
      reference: reference,
      amount: paymentResponse.data.data.amount  / 100,
      status: paymentResponse.data.data.status,
      username: user.username,
      transactiontype: "Credit",
    });
    console.log(transaction, "On line 310");
    if (!transaction) {
      return res.status(409).send({
        message: "error making transaction",
        status: false,
      });
    }
    const newWallet = user.wallet + paymentResponse.data.data.amount / 100;
    const result = await usermodel.updateOne(
      { email },
      { $set: { wallet: newWallet } }
    );
    console.log(result);
    await notificationmodel.create({
      receiverEmail: `${email}`,
      message: `Dear ${transaction.username} You have successfully fund your wallet with an amount of  ${transaction.amount}`,
    });
    return res.status(200).send({
      message: "You have successfully fund your wallet",
      status: true,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    console.log(email);
    const OTP = generateCode();

    const user = await usermodel.findOne({ email: email });
    console.log(user, OTP);
    if (!user) {
      return res.status(404).send({ message: "User not found", status: false });
    }
    const forgotPassword = await tokenmodel.create({ email: email, OTP: OTP });
    console.log(forgotPassword);
    if (!forgotPassword) {
      return res.status(500).send({
        message: "Error generating OTP. Please try again",
        status: false,
      });
    }
    const username = user.username;
    await forgotpasswordmail(email, username, OTP);
    res
      .status(200)
      .send({ message: "Check your mail for OTP", status: true, OTP: OTP });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { OTP, password } = req.body;
    const findOTP = await tokenmodel.findOne({ OTP: OTP });
    console.log(findOTP);
    if (!findOTP) {
      return res.status(404).send({ message: "OTP not found. Try again" });
    }
    let hashedPassword = await bcryptjs.hash(password, 10);
    const Email = findOTP.email;
    console.log(Email);
    const update = await usermodel.updateOne(
      { email: Email },
      { $set: { password: hashedPassword } }
    );
    if (!update.acknowledged) {
      return res
        .status(500)
        .send({ message: "Error updating password. Try again" });
    }
    await tokenmodel.deleteOne({ _id: findOTP._id });
    return res
      .status(200)
      .send({ message: "Password updated successfully", status: true });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
const updatenotification = async (req, res, next) => {
  try {
    const {isread} = req.body
    const token = req.headers.authorization?.split(" ")[1];
    const email = verifyToken(token);
    const update = await notificationmodel.updateMany ({receiverEmail: email}, {$set: {isread: isread}})
     if (!update) {
      return res.status(402).send({message:"error ocurred when updating notification", status: false})
     }
    
     return res.status(200).send({message: "update successful", status: true})
  } catch (error) {
    console.log(error);
    next(error);
  }
};
const viewnotification = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const email = verifyToken(token);
    const notify = await notificationmodel.find({ receiverEmail: email });
    if (!notify) {
      return res.status(404).send({
        message: "No notification found",
        status: false,
      });
    }
    if (notify.length == 0) {
      return res.status(409).send({ message: "No notification found" });
    }
    const io = req.app.get('io');
    console.log(io, "notification io");
    
  let socketno =  await  io.to(email).emit('notification', {
      message: 'Notification fetched successfully',
      notify,
    });

    if (!socketno) {
      console.log("socket not working ");
    }

    console.log(socketno, "socket is working");
    return res
      .status(200)
      .send({
        message: "Notification fetched successful",
        status: true,
        notify,
      });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const deductuserwalet = async (username, amount, thriftId) =>{
   try {
   const user =  await usermodel.findOne({username: username})
   const thrift = await contributionmodel.findById({_id: thriftId})
   if (user && thrift) {
      user.wallet -= amount
      await user.save();
      console.log(`Deduction of ${amount} successful for ${username}`);
      thrift.wallet += amount
      await thrift.save()
   }else{
    console.log("user is not found");
   }
   } catch (error) {
    
   }
}
// setInterval(async () => {
//   try {
//     const contribution = await contributionmodel.find()
//      for (let i = 0; i < contribution.length; i++) {
//       const element = contribution[i];
//       console.log(element, "onecontribution");
//        if (element.peopleJoined == element.nopeople) {
//            if (element.plan == "monthly") {
//               element.member.forEach(member => {
//                 deductuserwalet(member.username, element.amount, element._id) 
//               });
//            }
//        }
      
//      }
    
//   } catch (error) {
//     console.log(error);
//   }
// }, [86400000]);
const thriftpayment = async(plan) =>{
    const contribution = await contributionmodel.find({plan:plan})
    if (contribution) {
      for (let i = 0; i < contribution.length; i++) {
        const element = contribution[i];
        console.log(element);
        if (element.peopleJoined == element.nopeople ) {
          element.member.forEach(member => {
            deductuserwalet(member.username, element.amount, element._id) 
          });
        }
      }
    }

}
cron.schedule(`0 0 8 * * *'`, () => {
  console.log('Processing daily contributions at 8:00 AM');
   thriftpayment('daily');
});
cron.schedule('0 0 8 * * 1', () => {
  console.log('Processing weekly contributions at 8:00 AM on Monday');
  thriftpayment('weekly');
});
cron.schedule('0 0 8 1 * *', () => {
  console.log('Processing monthly contributions at 8:00 AM on the 1st day of the month');
   thriftpayment('monthly');
});


module.exports = {
  signup,
  signin,
  contributor_signup,
  verifythriftLink,
  verifyuserToken,
  payment,
  getContribution,
  getallContribution,
  forgotPassword,
  resetPassword,
  viewnotification,
  updatenotification,
  initializepayment
};
