packer {
  required_plugins {
    amazon = {
      version = ">=1.0.0"
      source  = "github.com/hashicorp/amazon"
    }
  }
}
variable "source_ami" {
  type    = string
  default = "ami-0dfcb1ef8550277af"
}

variable "ssh_username" {
  type    = string
  default = "ec2-user"
}

variable "subnet_id" {
  type    = string
  default = "subnet-6e091909"
}

source "amazon-ebs" "webapp" {
  # which ami to use as the base
  # where to save the ami
  ami_name = "csye6225-${formatdate("YYYY_MM_DD_hh_mm_ss", timestamp())}"
  # source_ami = "ami-0dfcb1ef8550277af"
  instance_type = "t2.micro"
  region        = "us-east-1"
  # ssh_username = "ec2-user"
  ami_description = "AMI for CSYE 6225"
  ami_regions = [
    "us-east-1",
  ]

  aws_polling {
    delay_seconds = 120
    max_attempts  = 50
  }


  source_ami   = "${var.source_ami}"
  ssh_username = "${var.ssh_username}"
  # subnet_id     = "${var.subnet_id}"

  launch_block_device_mappings {
    delete_on_termination = true
    device_name           = "/dev/xvda"
    volume_size           = 8
    volume_type           = "gp2"
  }
}
build {
  #everythin in between
  #what to install
  #configure
  # files to copy
  name = "amazon ebs"
  sources = [
    "source.amazon-ebs.webapp"
  ]
  provisioner "file" {
    source      = "../webapp.zip"
    destination = "/home/ec2-user/webapp.zip"
  }
  provisioner "file" {
    source      = "./packer/webapp.service"
    destination = "/tmp/webapp.service"

  }
  provisioner "shell" {
    script = "./packer/app.sh"
  }


}