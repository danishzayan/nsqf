// import Company from '../models/Company.js';
// import State from '../models/State.js';
// import District from '../models/District.js';
// import Block from '../models/Block.js';

// --- Company Controllers ---
// export const createCompany = async (req, res) => {
//     try {
//         const company = new Company(req.body);
//         console.log("Creating company:", req.body);
//         await company.save();
//         res.status(201).send(company);
//     } catch (error) {
//         res.status(400).send(error);
//     }
// };

// export const getAllCompanies = async (req, res) => {
//     try {
//         const companies = await Company.find({});
//         res.status(200).send(companies);
//     } catch (error) {
//         res.status(500).send(error);
//     }
// };


// // --- State Controllers ---
// export const createState = async (req, res) => {
//     try {
//         // companyId should be in the request body
//         const state = new State(req.body);
//         await state.save();
//         res.status(201).send(state);
//     } catch (error) {
//         res.status(400).send(error);
//     }
// };

// export const getStatesByCompany = async (req, res) => {
//     try {
//         const states = await State.find({ companyId: req.params.companyId });
//         if (!states) {
//             return res.status(404).send();
//         }
//         res.status(200).send(states);
//     } catch (error) {
//         res.status(500).send(error);
//     }
// };


// // --- District Controllers ---
// export const createDistrict = async (req, res) => {
//     try {
//         // stateId and companyId should be in the request body
//         const district = new District(req.body);
//         await district.save();
//         res.status(201).send(district);
//     } catch (error) {
//         res.status(400).send(error);
//     }
// };

// export const getDistrictsByState = async (req, res) => {
//     try {
//         const districts = await District.find({ stateId: req.params.stateId });
//         if (!districts) {
//             return res.status(404).send();
//         }
//         res.status(200).send(districts);
//     } catch (error) {
//         res.status(500).send(error);
//     }
// };


// // --- Block Controllers ---
// export const createBlock = async (req, res) => {
//     try {
//         // districtId and companyId should be in the request body
//         const block = new Block(req.body);
//         await block.save();
//         res.status(201).send(block);
//     } catch (error) {
//         res.status(400).send(error);
//     }
// };

// export const getBlocksByDistrict = async (req, res) => {
//     try {
//         const blocks = await Block.find({ districtId: req.params.districtId });
//         if (!blocks) {
//             return res.status(404).send();
//         }
//         res.status(200).send(blocks);
//     } catch (error) {
//         res.status(500).send(error);
//     }
// };

